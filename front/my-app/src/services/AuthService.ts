import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { COGNITO } from '../configs/aws';

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
}