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
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();
export default function SignIn() {
  const [isLoginRed, setIsLoginRed] = React.useState<boolean>(false);
  const [isPasswordRed, setIsPasswordRed] = React.useState<boolean>(false);
  const link: string = process.env.NEXT_PUBLIC_BACKEND_LINK as string;
  const [count, setCount] = React.useState(0);
  const [isError, setIsError] = React.useState<string>("");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username: string = data.get("username") as string;
    const password: string = data.get("password") as string;

    if (username.length < 4) {
      setIsPasswordRed(false);
      setIsLoginRed(true);
      setIsError("Слишком короткий логин");
      return;
    } else if (password.length < 6) {
      setIsLoginRed(false);
      setIsPasswordRed(true);
      setIsError("Слишком короткий пароль");
      return;
    } else {
      setIsLoginRed(false);
      setIsPasswordRed(false);
      setCount(count + 1);
      setIsError("");

      if (count > 2) {
        setTimeout(() => {
          setCount(0);
        }, 5000);
        return alert("Слишком много попыток.Подожди несколько секунд");
      }
      const reg = async () => {
        try {
          const res = await axios
            .post(
              `${link}/register`,
              {
                username,
                password,
              },
              {
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              }
            )
            .then((response) => {
              if (response.data === true) {
                handleOpen();
                setTimeout(() => {
                  window.location.href = "/";
                }, 2000);
              } else {
                setIsError("Такой пользователь уже существует");
              }
            });
        } catch (error) {
          alert("Ошибка регистрации");
        }
      };
      reg();
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
            Регистрация
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
              label="Password"
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Зарегистрироваться
            </Button>
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              open={open}
              onClose={handleClose}
              closeAfterTransition
              slots={{ backdrop: Backdrop }}
              slotProps={{
                backdrop: {
                  timeout: 500,
                },
              }}
            >
              <Fade in={open} className="rounded-3xl text-center">
                <Box sx={style}>
                  <Typography
                    id="transition-modal-title"
                    variant="h6"
                    component="h2"
                  ></Typography>
                  <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                    Вы успешно зарегистрировались!
                  </Typography>
                </Box>
              </Fade>
            </Modal>

            <div className="flex justify-center">
              <Link href="/" variant="body2">
                {"Назад"}
              </Link>
            </div>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
