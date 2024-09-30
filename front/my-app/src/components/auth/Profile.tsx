import React from "react";
import { useInput } from "../../utils/forms";
import { FormattedMessage, useIntl } from "react-intl";
import { notificaton } from "../../utils/notifications";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, CssBaseline, TextField, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthService } from "../../services/AuthService";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { CognitoUserAttribute } from "amazon-cognito-identity-js";


const Profile: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const { setValue: setUsername, bind: bindUsername } = useInput("");
  const { setValue: setEmail, bind: bindEmail } = useInput("");
  const { value: firstName, setValue: setFirstName, bind: bindFirstName } = useInput("");
  const { value: lastName, setValue: setLastName, bind: bindLastName } = useInput("");
  const [birthdate, setBirthdate] = React.useState<Dayjs | null>(null);

  const intl = useIntl();
  const authService = new AuthService();

  React.useEffect(() => {
    if (authService.isLoggedIn()) {
      setUsername(authService.getCognitoUser().getUsername());
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
            case "name":
              setFirstName(res.Value);
              break;
            case "family_name":
              setLastName(res.Value);
              break;
            case "birthdate":
              setBirthdate(dayjs(res.Value, 'DD/MM/YYYY'));
              break;
            default:
              break;
          }
        })
      })
    }
  }, [])

  const modifyProfileHandler = (e: React.SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    setLoading(true);
    if (authService.isLoggedIn()) {
      let cogntoUserAttributes: CognitoUserAttribute[] = [
        new CognitoUserAttribute({ Name: "name", Value: firstName }),
        new CognitoUserAttribute({ Name: "family_name", Value: lastName }),
        new CognitoUserAttribute({ Name: "birthdate", Value: birthdate !== null ? birthdate.format('DD/MM/YYYY') : null }),
      ];
      authService.getCognitoUser().updateAttributes(cogntoUserAttributes, (error, result) => {
        if (error) {
          notificaton(intl.formatMessage({ id: "notification.error" }), error.message, "danger");
          setLoading(false);
          return;
        }
        notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "profile.saved" }), "success");
        setLoading(false);
      });
    }
  }

  const handleDateChange = (newValue: Dayjs | null) => {
    setBirthdate(newValue);
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
          <FormattedMessage id="profile.modifyProfile" />
        </Typography>
        <Box component="form" onSubmit={modifyProfileHandler} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            disabled
            label={intl.formatMessage({ id: "auth.username" })}
            {...bindUsername}
          />
          <TextField
            margin="normal"
            fullWidth
            disabled
            label={intl.formatMessage({ id: "auth.email" })}
            {...bindEmail}
            type="email"
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'left',
            }}
          >
            <TextField
              sx={{
                marginRight: '4px'
              }}
              margin="normal"
              fullWidth
              label={intl.formatMessage({ id: "profile.firstName" })}
              {...bindFirstName}
            />
            <TextField
              margin="normal"
              fullWidth
              label={intl.formatMessage({ id: "profile.lastName" })}
              {...bindLastName}
            />
          </Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              label={intl.formatMessage({ id: "profile.birthdate" })}
              format="MM/DD/YYYY"
              onChange={handleDateChange}
              value={birthdate}
              slots={{ textField: TextField }}
              slotProps={{ textField: { margin: "normal", fullWidth: true } }}
            />
          </LocalizationProvider>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            type="submit"
            disabled={loading}
          >
            {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
            <FormattedMessage id="profile.save" />
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Profile;