import bcrypt from 'bcrypt';
const saltRounds = 10;

export default class Bcrypt {
    async hash(password) {
        return await bcrypt.hash(password, saltRounds);
    }

    async compare(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}