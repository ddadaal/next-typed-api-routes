

export interface LoginInfo {
  /**
   * The username
   * @format idn-email
   * @maxLength 20
   **/
  username: string;

  /**
  * The password
  * @minLength 8
  */
  password: string;
}
