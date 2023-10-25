import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import imageCompression from "browser-image-compression";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/ButtonContainer";
import {
  postAccountnameDuplicate,
  postUserSignup,
  postUploadProfile
} from "../../api/auth";
import BasicProfileImg from "../../assets/images/signup-profile.svg";
import {
  Container,
  Title,
  SubTitle,
  ImageSection,
  Label,
  ProfileImg,
  ImgInput,
  Section,
  ErrorMessage
} from "./SetProfileStyle";

const ProfileSettingPage = () => {
  const URL = "https://api.mandarin.weniv.co.kr/";
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const location = useLocation();
  const userEmail = location.state.email;
  const userPassword = location.state.password;
  const [username, setUsername] = useState("");
  const [accountname, setAccountname] = useState("");
  const [intro, setIntro] = useState("");
  const [image, setImage] = useState("");
  const [usernameErrorMsg, setUsernameErrorMsg] = useState("");
  const [accountnameErrorMsg, setAccountnameErrorMsg] = useState("");
  const [usernameValid, setUsernameValid] = useState(false);
  const [accountnameValid, setAccountnameValid] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const formData = new FormData();
  const blobToFile = (blob, filename) => {
    const file = new File([blob], filename);
    return file;
  };

  const handleInputImage = async (e) => {
    const file = e.target.files[0];
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 220,
      useWebWorker: true
    };

    try {
      const compressedImg = await imageCompression(file, options);

      // Blob 객체를 File 객체로 변환하여 formData에 추가
      const compressedFile = blobToFile(compressedImg, file.name);
      formData.append("image", compressedFile);

      const imgData = await postUploadProfile(formData);
      console.log(imgData);
      setImage(URL + imgData.filename);
      console.log(image);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    const intro = e.target.value;
    setIntro(intro);
  };

  // username 유효성 검사
  const handleInputUsername = (e) => {
    const username = e.target.value;
    console.log(username);
    if (username === "") {
      setUsernameErrorMsg("*입력해주세요");
    } else {
      setUsernameValid(true);
      setUsernameErrorMsg("");
      setUsername(username);
    }
  };

  // accountname 유효성 검사
  const handleInputAccountname = async (e) => {
    const accountname = e.target.value;
    const accountnameRegex = /^[a-zA-Z0-9._]+$/;
    const checkAccountname = await postAccountnameDuplicate(accountname);
    if (accountname === "") {
      setAccountnameErrorMsg("*입력해주세요");
      setAccountnameValid(false);
    } else if (!accountnameRegex.test(accountname)) {
      setAccountnameErrorMsg("*영문, 숫자, 특수문자 ., _ 만 입력해주세요");
      setAccountnameValid(false);
    } else if (checkAccountname.message === "이미 가입된 계정ID 입니다.") {
      setAccountnameErrorMsg("*이미 존재하는 계정ID 입니다 😥");
      setAccountnameValid(false);
    } else {
      setAccountnameValid(true);
      setAccountnameErrorMsg("");
      setAccountname(accountname);
    }
  };

  /* 에러 메시지 초기화 */
  useEffect(() => {
    setUsernameErrorMsg("");
  }, [username]);

  useEffect(() => {
    setAccountnameErrorMsg("");
  }, [accountname]);

  const handleProfileSignup = async (e) => {
    e.preventDefault();
    if (usernameValid && accountnameValid) {
      const signupData = await postUserSignup(
        username,
        userEmail,
        userPassword,
        accountname,
        intro,
        image
      );
      setIsComplete(true);
      console.log(signupData);
      navigate("/login");
    } else {
      setIsComplete(false);
    }
  };

  /* 버튼 활성화 */
  const handleActivateButton = () => {
    return usernameValid && accountnameValid;
  };

  return (
    <Container>
      <Title>프로필 설정</Title>
      <SubTitle>나중에 언제든지 변경할 수 있습니다.</SubTitle>
      <form onSubmit={handleProfileSignup}>
        <ImageSection>
          <Label htmlFor="upload-image">
            <ProfileImg
              src={image || BasicProfileImg}
              alt="사용자 프로필 이미지"
            />
          </Label>
          <ImgInput
            type="file"
            accept="image/*"
            id="upload-image"
            ref={fileInputRef}
            onChange={handleInputImage}
          />
        </ImageSection>
        <Section>
          <Input
            label="사용자 이름"
            placeholder="2~10자 이내여야 합니다."
            id="username"
            type="text"
            name="username"
            onChange={handleInputUsername}
            required
          />
          {usernameErrorMsg && <ErrorMessage>{usernameErrorMsg}</ErrorMessage>}
          <Input
            label="계정 ID"
            placeholder="영문, 숫자, 특수문자(.),(_)만 사용 가능합니다."
            id="accountname"
            type="text"
            name="accountname"
            onChange={handleInputAccountname}
            required
          />
          {accountnameErrorMsg && (
            <ErrorMessage>{accountnameErrorMsg}</ErrorMessage>
          )}

          <Input
            label="소개"
            placeholder="자신에 대해 소개해 주세요!"
            id="intro"
            type="text"
            name="intro"
            onChange={handleInputChange}
            required
          />
        </Section>
        <Button
          width="322px"
          type="submit"
          disabled={!handleActivateButton()}
          // handleClick={handleProfileSignup}
        >
          짐넥 시작하기
        </Button>
      </form>
    </Container>
  );
};

export default ProfileSettingPage;
