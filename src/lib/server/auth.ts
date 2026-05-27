import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import { dash } from "@better-auth/infra";

import { db } from './db/client';
import * as schema from './db/auth-schema';

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
    plugins:[
        dash()
    ],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173', 
    trustedOrigins: [
        'https://ungumark.my.id', 
        'http://localhost:5173'
    ],
    database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema: {
            ...schema
        }
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
		requireEmailVerification: true
    },
    
    emailVerification: {
        sendOnSignUp: true, 
        sendVerificationEmail: async ({user, url, token}) => {
            try {
                await resend.emails.send({
                    from: 'UnguMark <no-reply@ungumark.my.id>',
                    to: user.email,
                    subject: 'Verifikasi Akun UnguMark Kamu',
                    html: `
                        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #7c3aed;">Selamat Datang di UnguMark!</h2>
                            <p>Halo ${user.name || 'User'},</p>
                            <p>Sedikit langkah lagi untuk mengamankan akunmu. Silakan klik tombol di bawah ini untuk memverifikasi alamat email:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${url}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verifikasi Email</a>
                            </div>
                            <p style="font-size: 12px; color: #64748b;">Abaikan pesan ini jika kamu tidak mendaftar di UnguMark.</p>
                        </div>
                    `               
                });
                console.log(`Email verifikasi dikirim ke ${user.email}: ${url}`);
            } catch (error) {
                console.error("Gagal mengirim email verifikasi:", error);
            }
        }
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }
    }
});

export type Session = typeof auth.$Infer.Session;