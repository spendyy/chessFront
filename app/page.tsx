"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useRouter } from "next/navigation";
// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignIn() {
  const [isLoginRed, setIsLoginRed] = React.useState<boolean>(false);
  const [isPasswordRed, setIsPasswordRed] = React.useState<boolean>(false);
  const link: string = process.env.NEXT_PUBLIC_BACKEND_LINK as string;
  const router = useRouter();
  const [isError, setIsError] = React.useState<string>("");
  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const Kek = async () =>
      await axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/verify`, { token })
        .then((response) => {
          router.push("/main");
        });
    Kek();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username: string = data.get("username") as string;
    const password: string = data.get("password") as string;

    if (username.length < 4) {
      setIsPasswordRed(false);
      setIsLoginRed(true);
      setIsError("Слишком короткий логин");
    } else if (password.length < 6) {
      setIsLoginRed(false);
      setIsPasswordRed(true);
      setIsError("Слишком короткий пароль");
    } else {
      setIsLoginRed(false);
      setIsPasswordRed(false);
      setIsError("");
      setCount(count + 1);
      if (count > 2) {
        setTimeout(() => {
          setCount(0);
        }, 10000);
        alert("Слишком много попыток.Подожди несколько секунд");
        return;
      }

      const login = async () => {
        try {
          const res = await axios.post(
            `${link}/login`,
            {
              username,
              password,
            },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          res.data.token ? localStorage.setItem("token", res.data.token) : null;
          res.data.token
            ? (window.location.href = "/main")
            : setIsError("Неправильный логин или пароль");
        } catch (error) {
          console.error(error);
        }
      };
      login();
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Авторизация
          </Typography>
          {isError.length > 0 ? (
            <p className="text-red-500">{isError}</p>
          ) : null}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              className={isLoginRed ? "bg-red-400" : "bg-white"}
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              className={isPasswordRed ? "bg-red-400" : "bg-white"}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Авторизоваться
            </Button>
            <div className="flex justify-center">
              <Link href="/register" variant="body2">
                {"Нет аккаунта? Зарегистрироваться"}
              </Link>
            </div>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
