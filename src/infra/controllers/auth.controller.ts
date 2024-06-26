import { Request, Response } from "express";
import { AuthService } from "../../domain/services/auth.service";
import { ValidationError } from "../../domain/errors/ValidationError";

export class AuthController {
    constructor(
        private service: AuthService
    ) {}

    async login(req: Request, res: Response) {
        const { email, password, otpCode } = req.body;
        
        try {
            const access_token = await this.service.login(email, password, otpCode);

            if (access_token) {
                return res.status(200).json({ access_token });
            }

            return res.status(201).json({ message: "Código de segurança criado, verifique seu email." });
        } catch (err) {
            console.error(err);

            if (err instanceof ValidationError) {
                return res.status(err.status).json({ error: err.message });
            }
            
            return res.status(500).end();
        }
    }

    async verify(req: Request, res: Response) {
        const access_token = req.headers.authorization;

        try {
            if (!access_token) throw new ValidationError(401, "TOKEN_NOT_PROVIDED");

            const decoded = await this.service.verify(access_token as string);

            return res.status(200).json(decoded);
        } catch (err) {
            console.error(err);

            if (err instanceof ValidationError) {
                return res.status(err.status).json({ error: err.message });
            }
            
            return res.status(500).end();
        }
    }
}