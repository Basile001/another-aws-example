import { Avatar, Button, CircularProgress, Divider, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { AuthService } from "../../services/AuthService";
import { useInput } from "../../utils/forms";
import { notificaton } from "../../utils/notifications";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useNavigate } from "react-router-dom";


const Security: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [globalLoading, setGlobalLoading] = React.useState(true);
    const [switchEmail, setSwitchEmail] = React.useState(false);
    const [switchVerificationCode, setSwitchVerificationCode] = React.useState(false);
    const [switchPassword, setSwitchPassword] = React.useState(false);
    const [switchDeleteUser, setSwitchDeleteUser] = React.useState(false);
    const { setValue: setEmail, bind: bindEmail } = useInput("");
    const { value: verified, setValue: setVerified } = useInput("");
    const { value: newEmail, setValue: setNewEmail, bind: bindNewEmail } = useInput("");
    const { value: confirmEmail, setValue: setConfirmEmail, bind: bindConfirmEmail } = useInput("");
    const { value: oldPassword, setValue: setOldPassword, bind: bindOldPassword } = useInput("");
    const { value: newPassword, setValue: setNewPassword, bind: bindNewPassword } = useInput("");
    const { value: confirmPassword, setValue: setConfirmPassword, bind: bindConfirmPassword } = useInput("");
    const { value: verificationCode, setValue: setVerificationCode, bind: bindVerificationCode } = useInput("");

    const authService = new AuthService();
    const navigate = useNavigate();
    const intl = useIntl();

    React.useEffect(() => {
        if (authService.isLoggedIn()) {
            authService.getCognitoUser().getUserAttributes((error, result) => {
                if (error) {
                    notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                    return;
                }
                result.forEach((res: CognitoUserAttribute) => {
                    switch (res.Name) {
                        case "email":
                            setEmail(res.Value);
                            break;
                        case "email_verified":
                            setVerified(res.Value);
                            break;
                        default:
                            break;
                    }
                })
                setGlobalLoading(false);
            })
        }
    }, []);

    const cleanValue = () => {
        setNewEmail("");
        setConfirmEmail("");
        setConfirmPassword("");
        setNewPassword("");
        setVerificationCode("");
        setOldPassword("");
    }

    const handleSwitchEmail = () => {
        setSwitchEmail(!switchEmail);
    }

    const handleSwitchPassword = () => {
        setSwitchPassword(!switchPassword);
    }

    const handleSwitchDeleteUser = () => {
        setSwitchDeleteUser(!switchDeleteUser);
    }

    const modifyEmailHandler = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true)
        if (newEmail !== confirmEmail) {
            notificaton(
                intl.formatMessage({ id: "notification.error" }),
                intl.formatMessage({ id: "auth.security.sameEmail" }),
                "danger"
            );
            setLoading(false);
            return;
        }
        if (authService.isLoggedIn()) {
            let cogntoUserAttributes: CognitoUserAttribute[] = [
                new CognitoUserAttribute({ Name: "email", Value: newEmail })
            ];
            authService.getCognitoUser().updateAttributes(cogntoUserAttributes, (error, result) => {
                if (error) {
                    notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                    setLoading(false);
                    return;
                }
                notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.security.emailChanged" }), "success");
                setSwitchVerificationCode(!switchVerificationCode);
                setLoading(false);
            });
        }
    }

    const verifyEmailHandler = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true)
        if (authService.isLoggedIn()) {
            authService.getCognitoUser().verifyAttribute("email", verificationCode, {
                onFailure: (error) => {
                    notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                    setLoading(false);
                    return;
                },
                onSuccess: (success) => {
                    notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.security.emailVerified" }), "success");
                    setSwitchVerificationCode(!switchVerificationCode);
                    setSwitchEmail(!switchEmail);
                    setEmail(newEmail);
                    setVerified("true");
                    cleanValue();
                    setLoading(false);
                }
            });
        }
    }

    const handleVerificationEmail = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        if (verified === "true") {
            notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.security.emailAlreadyVerified" }), "success");
        } else if (authService.isLoggedIn()) {
            authService.getCognitoUser().getAttributeVerificationCode("email", {
                onFailure: (error) => {
                    notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                    return;
                },
                onSuccess: () => {
                    setSwitchVerificationCode(!switchVerificationCode);
                    setSwitchEmail(!switchEmail);
                }
            });
        }
    }

    const modifyPasswordHandler = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true);
        if (newPassword !== confirmPassword) {
            notificaton(
                intl.formatMessage({ id: "notification.error" }),
                intl.formatMessage({ id: "auth.samePassword" }),
                "danger"
            );
            setLoading(false);
            return;
        }
        if (authService.isLoggedIn()) {
            authService.getCognitoUser().changePassword(oldPassword, newPassword, (error, success) => {
                if (error) {
                    notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                    setLoading(false);
                    return;
                }
                notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.password.changed" }), "success");
                setSwitchPassword(!switchPassword);
                cleanValue();
                setLoading(false);
            })
        }
    }

    const confirmDeleteUserHandler = async (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true);
        if (authService.isLoggedIn()) {
            const resultDelete = await authService.deleteAllDataForUser();
            if (resultDelete.status === 200) {
                authService.getCognitoUser().deleteUser((error, result) => {
                    if (error) {
                        notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
                        setLoading(false);
                        return;
                    }
                    notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "auth.security.accountDeleted" }), "success");
                    setLoading(false);
                    navigate("/");
                });
            } else {
                notificaton(intl.formatMessage({ id: "notification.error" }), intl.formatMessage({ id: "auth.security.accountDeleteFailed" }), "danger");
            }
        }
    }

    const changeEmailOff = <Grid
        marginTop={3}
        justifyContent="center"
        alignItems="center"
        container
        spacing={1}>
        <Grid item xs={8}>
            <TextField
                fullWidth
                disabled
                label={intl.formatMessage({ id: "auth.email" })}
                type="email"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={intl.formatMessage({ id: "auth.security.verifiedEmail" })}
                                onClick={handleVerificationEmail}
                            >
                                {verified === "true" ? <VerifiedUserRoundedIcon color="success" /> : <CancelRoundedIcon color="error" />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                {...bindEmail}
            />
        </Grid>
        <Grid item xs={4}>
            <Button
                onClick={handleSwitchEmail}
                variant="contained"
                disabled={loading}>
                {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                <FormattedMessage id="auth.security.modify" />
            </Button>
        </Grid>
    </Grid>

    const changeEmailOn = <Box component="form" onSubmit={modifyEmailHandler} sx={{ mt: 1 }}>
        <TextField
            margin="normal"
            fullWidth
            label={intl.formatMessage({ id: "auth.security.newEmail" })}
            type="email"
            {...bindNewEmail}
        />
        <TextField
            margin="normal"
            fullWidth
            label={intl.formatMessage({ id: "auth.security.confirmEmail" })}
            type="email"
            {...bindConfirmEmail}
        />
        <Grid
            margin={1}
            spacing={2}
            justifyContent="right"
            container
            flexDirection="row">
            <Grid item >
                <Button
                    onClick={handleSwitchEmail}
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.cancel" />
                </Button>
            </Grid>
            <Grid item >
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.ok" />
                </Button>
            </Grid>
        </Grid>
    </Box>

    const changeEmailVerificationCode = <Box component="form" onSubmit={verifyEmailHandler} sx={{ mt: 1 }}>
        <TextField
            margin="normal"
            required
            fullWidth
            label={intl.formatMessage({ id: "auth.verificationCode" })}
            helperText={intl.formatMessage({ id: "auth.helperVerificationCode" })}
            type="number"
            {...bindVerificationCode}
        />
        <Grid
            margin={1}
            spacing={2}
            justifyContent="right"
            container
            flexDirection="row">
            <Grid item >
                <Button
                    onClick={handleSwitchEmail}
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.cancel" />
                </Button>
            </Grid>
            <Grid item >
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.ok" />
                </Button>
            </Grid>
        </Grid>
    </Box>


    const changePasswordOff = <Grid
        marginTop={3}
        justifyContent="center"
        alignItems="center"
        container
        spacing={1}>
        <Grid item xs={8}>
            <TextField
                fullWidth
                disabled
                label={intl.formatMessage({ id: "auth.password" })}
                type="password"
                value="1234567891011"
            />
        </Grid>
        <Grid item xs={4}>
            <Button
                onClick={handleSwitchPassword}
                variant="contained"
                disabled={loading}>
                {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                <FormattedMessage id="auth.security.modify" />
            </Button>
        </Grid>
    </Grid>

    const changePasswordOn = <Box component="form" onSubmit={modifyPasswordHandler} sx={{ mt: 1 }}>
        <TextField
            margin="normal"
            fullWidth
            label={intl.formatMessage({ id: "auth.security.oldPassword" })}
            type="password"
            {...bindOldPassword}
        />
        <TextField
            margin="normal"
            fullWidth
            label={intl.formatMessage({ id: "auth.security.newPassword" })}
            type="password"
            {...bindNewPassword}
        />
        <TextField
            margin="normal"
            fullWidth
            label={intl.formatMessage({ id: "auth.confirmPassword" })}
            type="password"
            {...bindConfirmPassword}
        />
        <Grid
            margin={1}
            spacing={2}
            justifyContent="right"
            container
            flexDirection="row">
            <Grid item >
                <Button
                    onClick={handleSwitchPassword}
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.cancel" />
                </Button>
            </Grid>
            <Grid item >
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.ok" />
                </Button>
            </Grid>
        </Grid>
    </Box>

    const deleteUserOff = <Grid
        marginTop={3}
        justifyContent="center"
        alignItems="center"
        container
        spacing={1}>
        <Grid item xs={8}>
            <Typography>
                <FormattedMessage id="auth.security.deleteAccount" />
            </Typography>
        </Grid>
        <Grid item xs={4}>
            <Button
                onClick={handleSwitchDeleteUser}
                variant="contained"
                disabled={loading}>
                {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                <FormattedMessage id="auth.security.delete" />
            </Button>
        </Grid>
    </Grid>

    const deleteUserOn = <Box component="form" onSubmit={confirmDeleteUserHandler} sx={{ mt: 1 }}>
        <Typography>
            <FormattedMessage id="auth.security.deleteAccountConfirm" />
        </Typography>
        <Grid
            margin={1}
            spacing={2}
            justifyContent="right"
            container
            flexDirection="row">
            <Grid item >
                <Button
                    onClick={handleSwitchDeleteUser}
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.cancel" />
                </Button>
            </Grid>
            <Grid item >
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}>
                    {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                    <FormattedMessage id="button.ok" />
                </Button>
            </Grid>
        </Grid>
    </Box>

    let changeEmailComponent: JSX.Element = <></>;
    let changePasswordComponent: JSX.Element = <></>;
    let deleteUserComponent: JSX.Element = <></>;

    // can be improve with an enum and a  switch
    if (!switchEmail && !switchPassword && !switchDeleteUser) {
        changeEmailComponent = changeEmailOff;
        changePasswordComponent = changePasswordOff;
        deleteUserComponent = deleteUserOff;
    } else if (switchEmail) {
        changeEmailComponent = switchVerificationCode ? changeEmailVerificationCode : changeEmailOn;
        changePasswordComponent = <></>;
        deleteUserComponent = <></>;
    } else if (switchPassword) {
        changeEmailComponent = <></>;
        changePasswordComponent = changePasswordOn;
        deleteUserComponent = <></>;
    } else if (switchDeleteUser) {
        changeEmailComponent = <></>;
        changePasswordComponent = <></>;
        deleteUserComponent = deleteUserOn;
    }

    return (
        <>
            {globalLoading ?
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box> :
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
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            <FormattedMessage id="menu.security" />
                        </Typography>
                        {changeEmailComponent}
                        <Divider />
                        {changePasswordComponent}
                        <Divider />
                        {deleteUserComponent}
                    </Box>
                </Container>
            }
        </>
    )
}

export default Security;