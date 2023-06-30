import React, { useState, ChangeEvent, FormEvent } from 'react';
import { auth } from '../../firebase/firebase';
import {browserSessionPersistence, setPersistence, signInWithEmailAndPassword} from "firebase/auth";
import firebase from "firebase/compat";

interface LoginProps {
    // Add any props you need for the login component
}

interface LoginForm {
    email: string;
    password: string;
}

const Login: React.FC<LoginProps> = () => {
    const [form, setForm] = useState<LoginForm>({
        email: '',
        password: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, form.email, form.password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    auth.updateCurrentUser(user)
                    console.log("HERE")
                    console.log(user.email);
                });
            setPersistence(auth, browserSessionPersistence)
                .then(() => {
                        return signInWithEmailAndPassword(auth, form.email, form.password)
                            .then((userCredential) => {
                                const user = userCredential.user;
                                auth.updateCurrentUser(user)
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                ).catch((error) => {
                console.log(error);
            });
        }
        catch (e) {
            console.log(e);
        };
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;