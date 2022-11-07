import { CognitoUserSession } from 'amazon-cognito-identity-js';
import axios from 'axios';
import { API_URL } from '../configs/aws';
import { AuthService } from './AuthService';


export interface Note {
    id?: string;
    name: string;
    description?: string;
}

export class NoteService {

    authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }


    saveNote = async (note: Note): Promise<Error | any> => {
        return this.authService.getCognitoUser().getSession(async (error: Error, session: CognitoUserSession | null) => {
            if (error) {
                return error;
            }
            const { data, status } = await axios.post(`${API_URL}note`, {
                note
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                },
            });
            return { data, status };
        });
    }

    getAllNote = async (): Promise<Error | any> => {
        return this.authService.getCognitoUser().getSession(async (error: Error, session: CognitoUserSession | null) => {
            if (error) {
                return error;
            }
            const { data, status } = await axios.get(`${API_URL}note`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                },
            });
            return { notes: data, status };
        });
    }

    getNote = async (noteId: string): Promise<Error | any> => {
        return this.authService.getCognitoUser().getSession(async (error: Error, session: CognitoUserSession | null) => {
            if (error) {
                return error;
            }
            const { data, status } = await axios.get(`${API_URL}note/${noteId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                },
            });
            return { note: data, status };
        });
    }

    updateNote = async (note: Note): Promise<Error | any> => {
        return this.authService.getCognitoUser().getSession(async (error: Error, session: CognitoUserSession | null) => {
            if (error) {
                return error;
            }
            const { data, status } = await axios.put(`${API_URL}note/${note.id}`, {
                note
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                },
            });
            return { data, status };
        });
    }

    deleteNote = async (noteId: string): Promise<Error | any> => {
        return this.authService.getCognitoUser().getSession(async (error: Error, session: CognitoUserSession | null) => {
            if (error) {
                return error;
            }
            const { data, status } = await axios.delete(`${API_URL}note/${noteId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': session.getIdToken().getJwtToken()
                },
            });
            return { data, status };
        });
    }
}
