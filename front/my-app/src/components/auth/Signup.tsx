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
import { CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';
import { COGNITO } from '../../configs/aws';

const Signup: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const intl = useIntl();

  const userPool = new CognitoUserPool({
    UserPoolId: COGNITO.USER_POOL_ID,
    ClientId: COGNITO.APP_CLIENT_ID
  });

  const { value: username, bind: bindUsername } = useInput("");
  const { value: email, bind: bindEmail } = useInput("");
  const { value: password, bind: bindPassword } = useInput("");
  const { value: confirmPassword, bind: bindConfirmPassword } = useInput("");

  const handleSignUp = (e: React.SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      notificaton(
        intl.formatMessage({ id: "notification.error" }),
        intl.formatMessage({ id: "auth.samePassword" }),
        "danger"
      );
      setLoading(false);
      return;
    }
    userPool.signUp(
      username,
      confirmPassword,
      [
        new CognitoUserAttribute({ Name: "email", Value: email })
      ],
      [],
      (error, result) => {
        setLoading(false);
        if (error) {
          notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
          return;
        }
        notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.signupSuccess" }), "success");
        navigate("/login");
      }
    );
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
          <FormattedMessage id="auth.newAccount" />
        </Typography>
        <Box component="form" onSubmit={handleSignUp} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            autoFocus
            label={intl.formatMessage({ id: "auth.username" })}
            {...bindUsername}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={intl.formatMessage({ id: "auth.email" })}
            {...bindEmail}
            type="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={intl.formatMessage({ id: "auth.password" })}
            type="password"
            {...bindPassword}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label={intl.formatMessage({ id: "auth.confirmPassword" })}
            type="password"
            {...bindConfirmPassword}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
            }}
          >
            <Typography display="inline" sx={{ fontSize: '12px' }}>
              <FormattedMessage id="auth.password.minimum" />
            </Typography>
            <Typography display="inline" sx={{ fontSize: '12px' }}>
              <FormattedMessage id="auth.password.contains" />
            </Typography>
            <Typography display="inline" sx={{ fontSize: '12px', marginLeft: 3 }}>
              <FormattedMessage id="auth.password.numbers" />
            </Typography>
            <Typography display="inline" sx={{ fontSize: '12px', marginLeft: 3 }}>
              <FormattedMessage id="auth.password.specialChar" />
            </Typography>
            <Typography display="inline" sx={{ fontSize: '12px', marginLeft: 3 }}>
              <FormattedMessage id="auth.password.lists" />
            </Typography>
            <Typography display="inline" sx={{ fontSize: '12px', marginLeft: 3 }}>
              <FormattedMessage id="auth.password.upperLowerChar" />
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={loading}
          >
            {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
            <FormattedMessage id="auth.signUp" />
          </Button>
          <Grid container>
            <Grid item xs>
              <Link to="/login">
                <FormattedMessage id="auth.goToLogin" />
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;