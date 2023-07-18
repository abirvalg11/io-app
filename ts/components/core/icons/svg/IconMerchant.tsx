import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconMerchant = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 5V9C0 10.6602 0.776973 12.1764 2 13.0935V22H1C0.447715 22 0 22.4477 0 23C0 23.5523 0.447716 24 1 24H2V24H22V24H23C23.5523 24 24 23.5523 24 23C24 22.4477 23.5523 22 23 22H22V13.0935C23.223 12.1764 24 10.6602 24 9V5C24 2.23858 21.7614 0 19 0H5C2.23858 0 0 2.23858 0 5ZM20 13.9446C19.7697 13.9811 19.5332 14 19.2916 14C17.9025 14 16.6807 13.3699 15.8304 12.3893C15.7456 12.2914 15.5914 12.2909 15.5059 12.3883C14.6426 13.3716 13.4024 14 11.9996 14C10.597 14 9.35702 13.3718 8.49367 12.3887C8.40819 12.2914 8.25406 12.2919 8.1692 12.3897C7.31896 13.3701 6.09726 14 4.70842 14C4.46675 14 4.23027 13.9811 4 13.9446V22H8V18C8 16.8954 8.89543 16 10 16H14C15.1046 16 16 16.8954 16 18V22H20V13.9446ZM4.70842 12C3.28253 12 2 10.7295 2 9V5C2 3.34315 3.34315 2 5 2H7.30078V9.87156C6.95182 11.148 5.88415 12 4.70842 12ZM9.30078 9.69118C9.30852 9.71511 9.31542 9.7395 9.32144 9.76433C9.64273 11.0892 10.7528 12 11.9996 12C13.2464 12 14.3565 11.0892 14.6778 9.76433C14.684 9.73866 14.6912 9.71347 14.6992 9.68878V2H9.30078V9.69118ZM19.2916 12C18.1159 12 17.0482 11.148 16.6992 9.87156V2H19C20.6569 2 22 3.34315 22 5V9C22 10.7295 20.7175 12 19.2916 12ZM14 18V22H10V18H14Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconMerchant;