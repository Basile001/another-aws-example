import React from "react";
import TextField from "@mui/material/TextField";
import { useInput } from "../../utils/forms";
import { notificaton } from "../../utils/notifications";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useNavigate } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { COGNITO } from '../../configs/aws';


const Login: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const intl = useIntl();
  const userPool = new CognitoUserPool({
    UserPoolId: COGNITO.USER_POOL_ID,
    ClientId: COGNITO.APP_CLIENT_ID
  });

  const { value: username, bind: bindUsername } = useInput("");
  const { value: password, bind: bindPassword } = useInput("");

  const handleSubmit = async (e: React.SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    setLoading(true);

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });
    const userData = { Username: username, Pool: userPool };
    const cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        setLoading(false);
        notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.loginSuccess" }), "success");
        navigate("/dashboard");
      },
      onFailure: (error) => {
        notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
        setLoading(false);
      }
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          <FormattedMessage id="auth.signIn" />
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            autoFocus
            label={intl.formatMessage({ id: "auth.usernameEmail" })}
            {...bindUsername} />
          <TextField
            label={intl.formatMessage({ id: "auth.password" })}
            type="password"
            {...bindPassword}
            margin="normal"
            required
            fullWidth
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={loading}
          >
            {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
            <FormattedMessage id="auth.loginAccount" />
          </Button>
          <Grid container>
            <Grid item xs>
              <Link to="/resetPassword">
                <FormattedMessage id="auth.forgotPassword" />
              </Link>
            </Grid>
            <Grid item>
              <Link to="/signup">
                <FormattedMessage id="auth.makeNewAccount" />
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>

  );
};

export default Login;