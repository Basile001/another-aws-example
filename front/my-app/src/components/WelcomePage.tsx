import { Box, Container, CssBaseline, Divider, Link, Typography } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

const WelcomePage: React.FC = () => {

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
            <Divider sx={{ margin: 3 }} />
            <Typography component="h1" variant="h6">
                <FormattedMessage id="welcomePage.github" />
            </Typography>
            <Link href="https://github.com/Basile001/another-aws-example" target="_blank" rel="noopener">
                <FormattedMessage id="welcomePage.githubLink" />
            </Link>
            <Divider sx={{ margin: 3 }} />
            <Typography component="h1" variant="h6">
                <FormattedMessage id="welcomePage.whoami" />
            </Typography>
            <Divider sx={{ margin: 3 }} />
            <Typography component="h1" variant="h6">
                <FormattedMessage id="welcomePage.contactus" />
            </Typography>
        </Box>
    </Container>
}

export default WelcomePage;