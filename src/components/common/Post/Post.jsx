import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import iconDot from "../../../assets/images/icon-dot.svg";
import HeartIcon from "./HeartStyle";
import iconMessage from "../../../assets/images/icon-reply.svg";
import { deletePostData, reportUserPost } from "../Modal/ModalFunction";
import Modal from "../Modal/Modal";
import { userInfoAtom } from "../../../atoms/UserAtom";
import IconPostModal from "../Modal/IconPostModal";
import { postLike, deleteLike } from "../../../api/post";
import { useRecoilValue } from "recoil";
import HealthData from "./HealthData";
import profileImage from "../../../assets/images/signup-profile.svg";
import {
  PostArticle,
  PostProfileImg,
  PostNameWrap,
  UserSpan,
  AccountSpan,
  PostFlexWrap,
  DotImg,
  Wrap,
  PostContent,
  PostUploadImg,
  MessageImg,
  PostDay,
  ButtonWrap,
  HeartSpan,
  MessageSpan,
  Time,
  HealthWrap,
  ProfileButton,
  FeedButton,
  DotButton,
  HeartButton,
  MessageButton
} from "./PostStyle";

export default function Post({ data, commentCount }) {
  const navigate = useNavigate();
  const userInfo = useRecoilValue(userInfoAtom);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState([]);
  const [modalFunc, setModalFunc] = useState([]);
  const imageCheck = data?.image ? true : false;
  const arr = data?.content.split("&&&&");
  const token = localStorage.getItem("token");
  const account = userInfo.account;
  const [liked, setLiked] = useState(false);
  const [postLikeState, setPostLikeState] = useState(data && data.hearted);
  const [postLikeCount, setPostLikeCount] = useState(data && data.heartCount);
  const [isDelete, setIsDelete] = useState(false);

  useEffect(() => {
    setPostLikeCount(data && data.heartCount);
    setPostLikeState(data && data.hearted);
  }, [data]);

  const handleProfileClick = (e) => {
    navigate(`/profile/${data?.author.accountname}`);
  };

  const handleFeedClick = (e) => {
    navigate(`/post/${data?.author.accountname}/${data?.id}`);
  };

  const postId = data?.id;
  /* 좋아요 기능 */
  const fetchLike = async () => {
    const response = await postLike(token, postId);
    setPostLikeCount(response.post.heartCount);
    setPostLikeState(true);
  };

  /* 좋아요 취소 */
  const fetchDisLike = async () => {
    const response = await deleteLike(token, postId);
    setPostLikeCount(response.post.heartCount);
    setPostLikeState(false);
  };

  /* 좋아요 토글 */
  const handleToggleLike = async (e) => {
    if (liked) {
      await fetchDisLike();
      setLiked(false);
    } else {
      await fetchLike();
      setLiked(true);
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  }

  // 모달
  useEffect(() => {
    if (isDelete) {
      setIsDelete(false);
      setIsModalOpen(false);
    }
  }, [isDelete]);

  const onShowModal = (post) => {
    if (!isModalOpen) {
      setIsModalOpen(true);
      if (data.author.accountname === account) {
        setModalText(["삭제"]);
        setModalFunc([
          () => {
            deletePostData(token, postId, setIsDelete);
            setIsVisible(false);
          },
          () =>
            navigate(`uploadedit`, {
              state: {
                data: post
              }
            })
        ]);
      } else {
        setModalText(["신고"]);
        setModalFunc([() => reportUserPost(token, post.id)]);
      }
    }
  };

  /*이미지가 있으면 보여주고 없으면 기본이미지 보여줌*/
  const getImageSrc = (image) => {
    if (
      //만약 이미지가 존재하면서 특정 키워드를 포함하는 경우
      image.includes("api.mandarin.weniv.co.kr")
    ) {
      console.log("이미지가 존재합니다.");
      return image;
    } else {
      console.log("!!이미지가 존재하지 않습니다.");
      return profileImage;
    }
  };
  console.log(arr);
  console.log(data?.author.image);
  return isVisible ? (
    <>
      <PostArticle>
        <PostFlexWrap>
          <ProfileButton onClick={handleProfileClick}>
            <PostProfileImg
              src={data && getImageSrc(data?.author.image)}
              alt="프로필사진"></PostProfileImg>
            <PostNameWrap>
              <UserSpan>{data?.author.username}</UserSpan>
              <AccountSpan>{data?.author.accountname}</AccountSpan>
            </PostNameWrap>
          </ProfileButton>
          <Time>{data && arr[3]}</Time>
          <DotButton onClick={() => onShowModal("")}>
            <DotImg src={iconDot} alt="점 버튼"></DotImg>
          </DotButton>
        </PostFlexWrap>
        <Wrap>
          <FeedButton onClick={handleFeedClick}>
            <HealthWrap>
              <HealthData kind={data && arr[0]} data={data && arr[1]} />
            </HealthWrap>
            {imageCheck && (
              <PostUploadImg
                src={data?.image}
                alt="업로드한 사진"></PostUploadImg>
            )}
            <PostContent>{data && arr[2]}</PostContent>
          </FeedButton>
          <ButtonWrap>
            <HeartButton onClick={handleToggleLike}>
              <HeartIcon isLiked={postLikeState} />
              <HeartSpan>{postLikeCount}</HeartSpan>
            </HeartButton>
            <MessageButton onClick={handleFeedClick}>
              <MessageImg src={iconMessage} alt="댓글 이동 사진"></MessageImg>
              <MessageSpan>{commentCount}</MessageSpan>
            </MessageButton>
          </ButtonWrap>
          <PostDay>{formatDate(data?.createdAt)}</PostDay>
        </Wrap>
      </PostArticle>
      {isModalOpen && ( // 여기에 모달을 추가합니다.
        <Modal setIsModalOpen={setIsModalOpen}>
          {modalText.map((text, index) => (
            <IconPostModal
              key={index}
              text={text}
              onButtonClick={modalFunc[index]}
            />
          ))}
        </Modal>
      )}
    </>
  ) : null;
}
