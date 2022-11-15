import axios from 'axios';
import { API_URL } from '../configs/aws';

export interface Mail {
    email: string;
    title: string;
    body: string;
}

export class MailService {

    sendMail = async (mail: Mail): Promise<Error | any> => {
        const { data, status } = await axios.post(`${API_URL}send`, {
            mail
        }, {
            headers: {
                'Accept': 'application/json',
            },
        });
        return { data, status };
    }

}