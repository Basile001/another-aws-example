import { CognitoUserPool, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import axios from 'axios';
import { API_URL, COGNITO } from '../configs/aws';

export class AuthService {

  userPool: CognitoUserPool;
  cognitoUser: CognitoUser;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: COGNITO.USER_POOL_ID,
      ClientId: COGNITO.APP_CLIENT_ID
    });

    this.cognitoUser = this.userPool.getCurrentUser();
  }

  isLoggedIn(): boolean {
    let isAuth = false;

    if (this.cognitoUser != null) {
      this.cognitoUser.getSession((err: any, session: any) => {
        if (err) {
          alert(err.message || JSON.stringify(err));
        }
        isAuth = session.isValid();
      })
    }
    return isAuth;
  }

  getCognitoUser(): CognitoUser {
    return this.cognitoUser;
  }

  deleteAllDataForUser = async (): Promise<Error | any> => {
    return this.getCognitoUser().getSession(async (error: Error, session: CognitoUserSession | null) => {
      if (error) {
        return error;
      }
      const { data, status } = await axios.delete(`${API_URL}note`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': session.getIdToken().getJwtToken()
        },
      });
      return { data, status };
    });
  }
}