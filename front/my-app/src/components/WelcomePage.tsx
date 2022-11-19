import { Box, Container, CssBaseline, Divider, Typography, Button, TextField, Grid } from "@mui/material";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from '@mui/icons-material/GitHub';
import CircularProgress from "@mui/material/CircularProgress";
import { useInput } from "../utils/forms";
import { MailService } from "../services/MailService";
import { notificaton } from "../utils/notifications";
import { Link } from "react-router-dom";

const WelcomePage: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const { value: email, setValue: setEmail, bind: bindEmail } = useInput("");
    const { value: title, setValue: setTitle, bind: bindTitle } = useInput("");
    const { value: body, setValue: setBody, bind: bindBody } = useInput("");

    const intl = useIntl();
    const mailService = new MailService();

    const contactFormHandler = async (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        setLoading(true);
        if (title && body && title !== "" && body !== "") {
            const result = await mailService.sendMail({ email, title, body });
            if (result.status === 200) {
                notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "welcomePage.mailSent" }), "success");
            } else {
                notificaton(intl.formatMessage({ id: "notification.error" }), result, "danger");
            }
        }
        setEmail("");
        setTitle("");
        setBody("");
        setLoading(false);
    }

    return <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography component="h1" variant="h3">
                <FormattedMessage id="welcomePage.welcome" />
            </Typography>
            <Typography variant="subtitle1" sx={{ marginTop: 3 }} >
                <FormattedMessage id="welcomePage.intro" />
            </Typography>
            <Typography variant="subtitle1" sx={{ marginTop: 1 }} >
                <FormattedMessage id="welcomePage.moreInfo" />
                <Link to="blog"><FormattedMessage id="welcomePage.blogLink" /></Link>
            </Typography>
            <Divider sx={{ margin: 3 }} />
            <Typography component="h1" variant="h6">
                <FormattedMessage id="welcomePage.github" />
            </Typography>
            <Button
                sx={{ width: 330, marginTop: 2, marginLeft: 2 }}
                href="https://github.com/Basile001/another-aws-example"
                target="_blank"
                variant="contained"
            >
                <GitHubIcon sx={{ marginRight: 1 }} />
                <FormattedMessage id="welcomePage.githubLink" />
            </Button>
            <Divider sx={{ margin: 3 }} />
            <Typography component="h1" variant="h6">
                <FormattedMessage id="welcomePage.whoami" />
            </Typography>
            <Button
                sx={{ width: 250, marginTop: 2, marginLeft: 2 }}
                variant="contained"
                target="_blank"
                href="https://www.linkedin.com/in/basile-grandperret-a481b04a/"
            >
                <LinkedInIcon sx={{ marginRight: 1 }} />
                <FormattedMessage id="welcomePage.mylinkedin" />
            </Button>
            <Divider sx={{ margin: 3 }} />
            <Typography component="h1" variant="h6">
                <FormattedMessage id="welcomePage.contactus" />
            </Typography>
            <Box component="form" onSubmit={contactFormHandler} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    fullWidth
                    label={intl.formatMessage({ id: "welcomePage.yourEmail" })}
                    type="email"
                    {...bindEmail}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label={intl.formatMessage({ id: "welcomePage.title" })}
                    {...bindTitle}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    multiline
                    rows={4}
                    label={intl.formatMessage({ id: "welcomePage.request" })}
                    {...bindBody}
                />
                <Grid
                    margin={1}
                    spacing={2}
                    justifyContent="right"
                    container
                    flexDirection="row">
                    <Grid item >
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}>
                            {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
                            <FormattedMessage id="button.send" />
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    </Container>
}

export default WelcomePage;