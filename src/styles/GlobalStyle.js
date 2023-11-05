import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyle = createGlobalStyle`
  ${reset};

@font-face {
    font-family: 'SBAggroB';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/SBAggroB.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

@import url(//fonts.googleapis.com/earlyaccess/nanumgothic.css);

.nanumgothic * {
 font-family: 'Nanum Gothic', sans-serif;
}

@font-face {
    font-family: 'Pretendard-Regular';
    src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
}

* {
  box-sizing: border-box;
}

:root {
  font-size: 10px;
}

@font-face {
    font-family: 'EASTARJET-Medium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_231029@1.1/EASTARJET-Medium.woff2') format('woff2');
    font-weight: 500;
    font-style: normal;
}
@font-face {
    font-family: 'TAEBAEKfont';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2310@1.0/TAEBAEKfont.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'TheJamsil5Bold';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302_01@1.0/TheJamsil5Bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
}
body {
  color: inherit;
  font-family: 'Pretendard-Regular',sans-serif;
  font-weight: 700;
}

a {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

ol, ul, li {
  list-style: none;
}

button {
  box-shadow: none;
  border: none;
  padding: 0;
  background-color: inherit;
  color: inherit;
  cursor: pointer;
}

textarea {
  border: none;
  overflow: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;
}

button, input, textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
  border: none;
}

img {
  width: 100%;
  vertical-align: middle;
}

.a11y-hidden { 
  position: absolute; 
  width: 1px; 
  height: 1px; 
  padding: 0; 
  margin: -1px; 
  overflow: hidden; 
  clip: rect(0, 0, 0, 0); 
  border: 0;
}
`;

export default GlobalStyle;
