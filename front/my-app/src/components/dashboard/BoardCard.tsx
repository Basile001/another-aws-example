import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Note } from '../../services/NoteService';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface NoteCardProps {
    note: Note;
    handleDelete: any;
    handleEdit: any;
}

const NoteCard: React.FC<NoteCardProps> = (props) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const { note, handleDelete, handleEdit } = props;

    const open = Boolean(anchorEl);
    const intl = useIntl();


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const clickDelete = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        handleDelete(note.id);
        setAnchorEl(null);
    };

    const clickEdit = (e: React.SyntheticEvent<Element, Event>) => {
        e.preventDefault();
        handleEdit(note.id);
        setAnchorEl(null);
    };

    return <Card sx={{ minWidth: 275 }}>
        <CardHeader
            title={note.name}
            action={<>
                <IconButton aria-label={intl.formatMessage({ id: "dashboard.noteName" })}
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem onClick={handleClose}><FormattedMessage id="button.open" /></MenuItem>
                    <MenuItem onClick={clickEdit}><FormattedMessage id="button.edit" /></MenuItem>
                    <MenuItem onClick={clickDelete}><FormattedMessage id="button.delete" /></MenuItem>
                </Menu></>
            }
        />
        <CardContent>
            <Typography variant="body2">
                {note.description}
            </Typography>
        </CardContent>
        <CardActions>
            <Button size="small">
                <FormattedMessage id="button.open" />
            </Button>
        </CardActions>
    </Card>

}

export default NoteCard;
