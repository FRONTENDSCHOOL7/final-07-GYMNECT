import React, { useState, useEffect } from "react";
import { getUserPosts } from "../../api/post";
import {
  AnalysisWrapper,
  TitleWithButtons,
  LeftBtn,
  RightBtn,
  P,
  SecondaryText,
  ChartWrapper,
  Chart,
  Description,
  StatsContainer,
  DataContainer,
  DataTop,
  DataTitle,
  DataValue,
  DataUnit
} from "./ExerciseAnalysisStyle";
import moment from "moment"; // moment 라이브러리 추가
//운동분석 차트 라이브러리 추가
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const AnalysisData = ({ title, value, unit }) => {
  return (
    <DataContainer>
      <DataTop>
        <DataValue>{value}</DataValue>
        <DataUnit>{unit}</DataUnit>
      </DataTop>
      <DataTitle>{title}</DataTitle>
    </DataContainer>
  );
};

export default function ExerciseAnalysis({
  isOpen,
  username,
  accountId,
  token
}) {
  const [postData, setPostData] = useState([]); //게시물 데이터 상태
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0); // 0:이번주 -1:지난주 (이번주인지 지난주인지를 관리하는 상태변수)
  const aggregateDataByDay = (posts) => {
    //요일별 초기화
    const days = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0
    };

    posts.forEach((post) => {
      const dayOfWeek = moment(post.date).format("dddd");
      days[dayOfWeek] += post.time;
    });

    return days;
  };

  const chartOptions = {
    scales: {
      x: {
        type: "category",
        beginAtZero: true
      },
      y: {
        type: "linear",
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true
      }
    },
    maintainAspectRatio: false,
    aspectRatio: 15 // 너비 대비 높이 비율
  };
  const ExerciseChart = ({ data }) => {
    const chartData = {
      labels: ["일", "월", "화", "수", "목", "금", "토"],
      datasets: [
        {
          label: "운동 시간 (분)",
          data: Object.values(data),
          backgroundColor: "rgba(0, 123, 255, 0.626)",
          borderWidth: 1
        }
      ]
    };

    return <Bar data={chartData} options={chartOptions} />;
  };

  //주 변경 버튼 핸들러
  const handleWeekChange = (direction) => {
    //미래로 가는것 방지
    if (direction === 1 && currentWeek >= 0) return;

    setCurrentWeek(currentWeek + direction);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // API 호출
        const data = await getUserPosts(token, accountId, Infinity, 0);
        if (Array.isArray(data.post)) {
          // 현재 주의 시작일과 종료일 계산
          const startOfWeek = moment()
            .startOf("week")
            .add(currentWeek, "weeks");
          const endOfWeek = moment().endOf("week").add(currentWeek, "weeks");

          // 이번 주에 해당하는 게시물만 필터링
          const thisWeekPosts = data.post.filter((post) => {
            const postDate = moment(post.createdAt);
            return (
              postDate.isSameOrAfter(startOfWeek) &&
              postDate.isSameOrBefore(endOfWeek)
            );
          });
          console.log("thisWeekPosts", thisWeekPosts);
          const exerciseData = extractExerciseData(thisWeekPosts); //데이터 가공
          setPostData(exerciseData); // 가공된 데이터 저장
          console.log("exerciseData : ", exerciseData);

          const weeklyData = aggregateDataByDay(exerciseData);
          setWeeklyData(weeklyData);
          console.log("weeklyData : ", weeklyData);
        } else {
          console.error("API response is not an array:", data);
        }
      } catch (error) {
        console.error("게시글을 가져오는데 실패했습니다.", error);
      }
    };
    fetchPosts();
  }, [accountId, token, currentWeek]);

  //이번주의 시작일과 종료일 계산 (UI업데이트)
  const startOfWeek = moment()
    .startOf("week")
    .add(currentWeek, "weeks")
    .format("YYYY년 MM월 DD일");
  const endOfWeek = moment()
    .endOf("week")
    .add(currentWeek, "weeks")
    .format("MM월 DD일");

  //운동데이터 추출 함수
  const extractExerciseData = (postData) => {
    return postData.map((post) => {
      const parts = post.content.split("&&&&");

      let timeInMinutes = 0; //시간을 분으로 변환한 값
      //시간 문자열 파싱
      const timePattern = /(\d+)시간\s+(\d+)분/;
      const timeMatch = timePattern.exec(parts[3]);

      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      timeInMinutes = hours * 60 + minutes; // 시간을 분으로 변환
      console.log("timeInMinutes = ", timeInMinutes);

      //운동별 칼로리 계산 함수
      const calculateCalories = (exerciseType, timeInMinutes) => {
        const caloriesPerMinute = {
          근력운동: 7.3,
          달리기: 11.5,
          걷기: 4.3,
          등산: 9.8,
          "자전거 타기": 7.5,
          수영: 8.0,
          스트레칭: 3.0,
          필라테스: 5.0,
          발레: 6.0,
          풋살: 10.0,
          "기타 운동": 6.0 //일반적인 가벼운 운동 기준
        };
        return timeInMinutes * (caloriesPerMinute[exerciseType] || 6.0);
      };
      const kcal = calculateCalories(parts[0], timeInMinutes); //칼로리 변수
      const date = post.createdAt;
      if (parts[0] === "근력 운동") {
        const weightPattern = /\d+x\d+/g; // 무게 데이터 추출을 위한 정규표현식
        let weightSum = 0; //근력 운동 총 무게를 합산한 데이터
        let match;
        while ((match = weightPattern.exec(parts[1])) !== null) {
          const [sets, reps] = match[0].split("x").map(Number);
          weightSum += sets * reps; // 두 숫자를 곱하여 sum에 더함
        }
        const time = timeInMinutes; // 시간 데이터
        return { weightSum, time, kcal, date };
      } else if (["달리기", "걷기", "등산", "자전거 타기"].includes(parts[0])) {
        const distance = parts[1]; // 거리 데이터
        const time = timeInMinutes; // 시간 데이터
        return { distance, time, kcal, date };
      } else {
        //그 외 운동
        const time = timeInMinutes; // 시간 데이터
        return { time, kcal, date };
      }
    });
  };

  // exerciseData에서 볼륨, 거리 및 시간 데이터 추출
  let totalVolume = 0;
  let totalDistance = 0;
  let totalTime = 0;
  let totalKcal = 0;

  postData.forEach((data) => {
    if (data.weightSum) {
      totalVolume += data.weightSum;
    }
    if (data.distance) {
      totalDistance += parseFloat(data.distance);
    }
    if (data.time) {
      totalTime += data.time;
    }
    if (data.kcal) {
      totalKcal += data.kcal;
    }
  });
  console.log("totalVolume = ", totalVolume); //60으로 나눈 몫
  console.log("totalTime = ", totalTime); //60으로 나눈나머지

  const hours = Math.floor(totalTime / 60); //
  const minutes = totalTime % 60;

  return isOpen ? (
    <>
      <AnalysisWrapper>
        <P>주 단위 운동분석</P>

        <TitleWithButtons>
          <LeftBtn onClick={() => handleWeekChange(-1)} />
          <SecondaryText>
            {startOfWeek} ~ {endOfWeek}
          </SecondaryText>
          <RightBtn onClick={() => handleWeekChange(1)} />
        </TitleWithButtons>

        <StatsContainer>
          <AnalysisData title="볼륨" value={totalVolume} unit="kg" />
          <AnalysisData
            title="거리"
            value={totalDistance.toFixed(2)}
            unit="km"
          />
          <AnalysisData
            title="운동 시간"
            value={hours + "시간 " + minutes + "분"}
            unit=""
          />
          <AnalysisData
            title="예상 소비 칼로리"
            value={Math.floor(totalKcal)}
            unit="kcal"
          />
        </StatsContainer>
        {/* <Description>
          {username} 님의 주당 총 운동시간은 {hours}시간 {minutes}분 입니다!
        </Description> */}
        <ChartWrapper>
          <Chart>
            <ExerciseChart data={weeklyData} />
          </Chart>
        </ChartWrapper>
        <Description>
          {username} 님의 주당 총 운동시간은 {hours}시간 {minutes}분 입니다!
        </Description>
      </AnalysisWrapper>
    </>
  ) : null;
}