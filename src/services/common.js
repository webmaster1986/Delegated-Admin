import Cookies from "universal-cookie"
const cookies = new Cookies();

export const getUser = () => {
  return cookies.get('OAMUserName');
}
