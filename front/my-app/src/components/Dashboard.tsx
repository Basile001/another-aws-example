import React from "react";
import Button from "@mui/material/Button";
import { notificaton } from "./../utils/notifications";
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Avatar, Box, Card, CardActions, CardContent, CircularProgress, Container, CssBaseline, Grid, TextField, Typography } from "@mui/material";
import { useInput } from "../utils/forms";
import { AuthService } from "../services/AuthService";
import { Note, NoteService } from "../services/NoteService";
import NoteCard from "./dashboard/BoardCard";


const Dashboard: React.FC = () => {
  const [globalLoading, setGlobalLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [editedNoteId, setEditedNoteId] = React.useState<string>(null);
  const [switchCreate, setSwitchCreate] = React.useState(false);
  const [switchEdit, setSwitchEdit] = React.useState(false);
  const { value: name, setValue: setName, bind: bindName } = useInput("");
  const { value: description, setValue: setDescription, bind: bindDescription } = useInput("");

  const navigate = useNavigate();
  const intl = useIntl();

  const authService = new AuthService();
  const noteService = new NoteService();

  React.useEffect(() => {
    if (authService.isLoggedIn()) {
      noteService.getAllNote().then((res) => {
        if (res.status === 200) {
          setNotes(res.notes);
        } else {
          notificaton(intl.formatMessage({ id: "notification.error" }), intl.formatMessage({ id: "dashboard.loadingNoteError" }), "danger");
        }
      });
      setGlobalLoading(false);
    } else {
      navigate("/login")
    }
  }, []);

  const handleCreate = async (e: React.SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    setLoading(true);
    if (authService.isLoggedIn()) {
      const note: Note = { name: name, description: description };
      const result = await noteService.saveNote(note);
      if (result.status === 200) {
        noteService.getAllNote().then((res) => {
          if (res.status === 200) {
            notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "dashboard.createNoteSuccess" }), "success");
            setNotes(res.notes);
            setSwitchCreate(!switchCreate);
          } else {
            notificaton(intl.formatMessage({ id: "notification.error" }), res, "danger");
          }
          setLoading(false);
        });
      } else {
        notificaton(intl.formatMessage({ id: "notification.error" }), intl.formatMessage({ id: "dashboard.createNoteError" }), "danger");
        setLoading(false);
      }
    } else {
      navigate("/login");
    }
  }

  const handleUpdate = async (e: React.SyntheticEvent<Element, Event>) => {
    e.preventDefault();
    setLoading(true);
    if (authService.isLoggedIn()) {
      const noteUpdated: Note = { id: editedNoteId, name: name, description: description };
      const result = await noteService.updateNote(noteUpdated);
      if (result.status === 200) {
        notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "dashboard.editNoteSuccess" }), "success");
        setNotes(notes.map((proj) => proj.id === noteUpdated.id ? noteUpdated : proj))
        setEditedNoteId(null);
        setSwitchEdit(!switchEdit);
      } else {
        notificaton(intl.formatMessage({ id: "notification.error" }), intl.formatMessage({ id: "dashboard.editNoteError" }), "danger");
      }
      setLoading(false);
    } else {
      navigate("/login");
    }
  }

  const handleDelete = async (noteId: string) => {
    setLoading(true);
    if (authService.isLoggedIn()) {
      const result = await noteService.deleteNote(noteId);
      if (result.status === 200) {
        notificaton(intl.formatMessage({ id: "notification.success" }), intl.formatMessage({ id: "dashboard.deleteNoteSuccess" }), "success");
        setNotes(notes.filter((proj) => proj.id !== noteId));
      } else {
        notificaton(intl.formatMessage({ id: "notification.error" }), intl.formatMessage({ id: "dashboard.deleteNoteError" }), "danger");
      }
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const handleEdit = async (noteId: string) => {
    setLoading(true);
    if (authService.isLoggedIn()) {
      // just get the note for the example in reality we already load the note object
      const result = await noteService.getNote(noteId);
      if (result.status === 200) {
        setEditedNoteId(result.note.id);
        setName(result.note.name);
        setDescription(result.note.description);
        setSwitchEdit(!switchEdit);
      }
      setLoading(false);
    } else {
      navigate("/login");
    }
  }

  const toggleCreate = () => {
    if (switchCreate) {
      setEditedNoteId(null);
      setName("");
      setDescription("");
    }
    setSwitchCreate(!switchCreate);
  }

  const toggleEdit = () => {
    if (switchEdit) {
      setEditedNoteId(null);
      setName("");
      setDescription("");
    }
    setSwitchEdit(!switchEdit);
  }

  const createNoteForm = <Box component="form" onSubmit={switchCreate ? handleCreate : handleUpdate} sx={{ mt: 1 }}>
    <TextField
      margin="normal"
      fullWidth
      label={intl.formatMessage({ id: "dashboard.noteName" })}
      {...bindName}
    />
    <TextField
      margin="normal"
      fullWidth
      label={intl.formatMessage({ id: "dashboard.noteDescription" })}
      {...bindDescription}
    />
    <Grid
      margin={1}
      spacing={2}
      justifyContent="right"
      container
      flexDirection="row">
      <Grid item >
        <Button
          onClick={switchCreate ? toggleCreate : toggleEdit}
          variant="contained"
          disabled={loading}>
          {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
          <FormattedMessage id="button.cancel" />
        </Button>
      </Grid>
      <Grid item >
        <Button
          variant="contained"
          type="submit"
          disabled={loading}>
          {loading && <CircularProgress size={20} style={{ marginRight: 20 }} />}
          {switchCreate ? <FormattedMessage id="button.create" /> : <FormattedMessage id="button.ok" />}
        </Button>
      </Grid>
    </Grid>
  </Box>

  return (
    <>
      {globalLoading ?
        <Box sx={{ display: 'flex' }}>
          <CircularProgress />
        </Box> :
        <Container component="main" maxWidth="xl">
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
              <DashboardCustomizeOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              <FormattedMessage id="dashboard.welcome" />
            </Typography>
            {switchCreate || switchEdit ? createNoteForm :
              <Grid container spacing={2} justifyContent='center' sx={{
                display: 'flex',
                flexDirection: 'row',
                mt: 1
              }}>
                {
                  notes.map((note, i) => (
                    <Grid item key={i}>
                      <NoteCard
                        note={note}
                        handleDelete={handleDelete}
                        handleEdit={handleEdit} />
                    </Grid>
                  ))
                }
                <Grid item>
                  <Card sx={{ minWidth: 275 }}>
                    <CardContent>
                      <Typography>
                        <FormattedMessage id="dashboard.createNote" />
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={toggleCreate}>
                        <FormattedMessage id="button.create" />
                      </Button>
                    </CardActions>
                  </Card>

                </Grid>
              </Grid>
            }
          </Box>
        </Container>
      }
    </>
  );
};

export default Dashboard;