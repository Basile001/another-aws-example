import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useNavigate } from "react-router-dom";
import { COGNITO } from "../../configs/aws";
import { useInput } from "../../utils/forms";
import { notificaton } from "../../utils/notifications";


const ResetPassword: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [confirm, setConfirm] = React.useState(false);
    const [user, setUser] = React.useState<CognitoUser | null>(null);

    const { value: email, bind: bindEmail } = useInput("");
    const { value: password, bind: bindPassword } = useInput("");
    const { value: confirmPassword, bind: bindConfirmPassword } = useInput("");
    const { value: verificationCode, bind: bindVerificationCode } = useInput("");


    const userPool = new CognitoUserPool({
        UserPoolId: COGNITO.USER_POOL_ID,
        ClientId: COGNITO.APP_CLIENT_ID
    });

    const intl = useIntl();
    const navigate = useNavigate();

    const sendMailHandler = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true);

        // setup cognitoUser first
        const userData = { Username: email, Pool: userPool };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: (result) => {
                setLoading(false);
                setConfirm(true);
                setUser(cognitoUser);
                notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.password.emailSent" }), "success");
            },
            onFailure: (error) => {
                notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                setLoading(false);
            }
        })
    }

    const changePasswordHandler = (e: React.SyntheticEvent<Element, Event>) => {
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
        if (confirm && user !== null) {
            user.confirmPassword(verificationCode, password, {
                onSuccess: () => {
                    setLoading(false);
                    notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.password.changedRedirect" }), "success");
                    navigate("/login")
                },
                onFailure: (error) => {
                    notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                    setLoading(false);
                }
            })
        }
    }

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography marginBottom={2} component="h1" variant="h5">
                    <FormattedMessage id="auth.password.cantConnect" />
                </Typography>
                {!confirm ?
                    <Box component="form" onSubmit={sendMailHandler} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            required
                            label={intl.formatMessage({ id: "auth.password.recuperationLink" })}
                            {...bindEmail}
                            type="email"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                            <FormattedMessage id="auth.password.sendRecuperationLink" />
                        </Button>
                    </Box>
                    :
                    <Box component="form" onSubmit={changePasswordHandler} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={intl.formatMessage({ id: "auth.verificationCode" })}
                            helperText={intl.formatMessage({ id: "auth.helperVerificationCode" })}
                            type="number"
                            {...bindVerificationCode}
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
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                            <FormattedMessage id="auth.password.change" />
                        </Button>
                    </Box>
                }

                <Link to="/login">
                    <FormattedMessage id="auth.goToLogin" />
                </Link>
            </Box>
        </Container>

    );

}

export default ResetPassword;