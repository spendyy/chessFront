"use client";
import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { io } from "socket.io-client";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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

export default function Main() {
  const [name, Setname] = useState<string>("");
  const [role, Setrole] = useState<number>(0);
  const [elo, Setelo] = useState<number>(0);
  const [rooms, SetRooms] = useState<any[]>([]);
  const [avatar, SetAvatar] = useState<string>("");
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const token = localStorage.getItem("token");
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }
    const file = event.target.files[0];
    setSelectedFile(file);
    console.log(selectedFile);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Здесь вы можете отправить selectedFile на бэкенд
      console.log("Файл выбран:", selectedFile);

      const formData = new FormData();
      formData.append("avatar", selectedFile);
      formData.append("username", name);
      // Например, используя FormData и fetch, как в предыдущих примерах

      axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/avatar`, formData)
        .then((response) => {
          window.location.reload();
        });
    }
  };

  function timeSince(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
      return seconds + " секунд назад";
    } else if (seconds < 3600) {
      return Math.floor(seconds / 60) + " минут назад";
    } else if (seconds < 86400) {
      return Math.floor(seconds / 3600) + " часов назад";
    } else {
      return "более суток назад";
    }
  }

  function deleteRoom(name: string) {
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/rooms/delete`, { name })
      .then((response) => {
        console.log(name);
        window.location.reload();
      });
  }

  function joinRoom(jwt: string) {
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/joinroom`, {
      name,
      avatar,
      jwt,
      rating: elo,
    });
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_LINK}`);

    socket.emit("needreload", jwt);

    setTimeout(() => {
      window.location.href = `/main/${jwt}`;
    }, 1000);
  }

  function createRoom() {
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/rooms/create`, { name })
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => {
        handleOpen();
      });
  }

  React.useEffect(() => {
    const mainInfoGet = async () =>
      await axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/verify`, { token })
        .then((response) => {
          if ("Пользователь не авторизован" === response.data) {
            localStorage.clear();
            window.location.href = "/";
          }
          Setname(response.data.username);
          Setrole(response.data.role_id);
          Setelo(response.data.elo);
          SetAvatar(response.data.image_url);
          console.log(response.data.image_url);
        });
    mainInfoGet();

    const getRooms = async () =>
      await axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/rooms`)
        .then((response) => {
          console.log(response.data);
          SetRooms(response.data);
        });
    getRooms();
  }, []);

  return (
    <div className="flex flex-col bg-slate-400 items-center h-screen">
      <div className="w-3/4 ">
        <Button
          className="mt-4"
          variant="contained"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          {" "}
          Выйти
        </Button>

        <div className="bg-slate-300 w-3/4 m-auto rounded-lg">
          <div className="mx-4 flex flex-row ">
            <div className="w-1/3">
              <div>
                {" "}
                <img
                  width={200}
                  height={100}
                  className="rounded-3xl mt-2 object-cover"
                  src={
                    avatar?.slice(0, -1) === undefined
                      ? "https://pngset.com/images/avatar-icons-person-cushion-camera-electronics-transparent-png-2376333.png"
                      : process.env.NEXT_PUBLIC_BACKEND_LINK +
                        avatar?.slice(0, -1)
                  }
                ></img>
              </div>
              <label>
                <div className="ml-6">
                  <Button
                    role={undefined}
                    component="label"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    className="mx-7 mt-2 w-36 h-5"
                  >
                    Загрузить
                    <VisuallyHiddenInput
                      onChange={handleFileChange}
                      type="file"
                    />
                  </Button>
                  <Button
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    className="mx-7 mt-2 w-36 h-8 mb-2"
                    onClick={handleUpload}
                  >
                    Отправить
                  </Button>
                </div>
              </label>
              <p>Здравствуйте, {name}</p>
              <p>Ваша роль: {role === 1 ? "Пользователь" : "Администратор"}</p>
              <p>Рейтинг: {elo}</p>{" "}
            </div>
            <div className="flex flex-row justify-around w-full">
              <div className="flex flex-col justify-center">
                <img
                  src="images/chess.png"
                  width={120}
                  className="mx-auto"
                ></img>
                <p className="pt-2">Сейчас в поиске: </p>
                <Button className="mt-2" variant="contained">
                  {" "}
                  Поиск
                </Button>
              </div>
              <div className="flex flex-col justify-center">
                <img
                  src="images/battle.png"
                  width={140}
                  className="mx-auto"
                ></img>
                <Button
                  className="mt-4"
                  variant="contained"
                  onClick={createRoom}
                >
                  {" "}
                  Создать комнату
                </Button>
              </div>{" "}
            </div>
          </div>{" "}
        </div>
        <div className="bg-slate-300 w-3/4 m-auto rounded-lg mt-8 flex flex-col">
          <h1 className="text-center text-4xl pt-4">Комнаты</h1>
          <div className=" w-full bg-slate-100 text-2xl  border-b border-slate-300 grid grid-cols-12">
            <img src="images/vs.png" width={40} className="my-auto"></img>{" "}
            <p className="col-span-2">Автор</p>
            <p className="col-span-6">Дата создания</p>
            <p className="col-span-1"> </p>
            <p className="col-start-12"> </p>
          </div>

          {rooms.map((room) => (
            <div
              className=" w-full bg-slate-100 text-2xl  border-b border-slate-300 grid grid-cols-12"
              key={room.id}
            >
              <img src="images/vs.png" width={40} className="my-auto"></img>{" "}
              <p className="col-span-2">{room.name}</p>
              <p className="col-span-6">{timeSince(new Date(room.date))}</p>
              {room.name === name || role === 2 ? (
                <Button
                  onClick={() => deleteRoom(room.name)}
                  className="col-span-1"
                  variant="contained"
                  color="error"
                >
                  {" "}
                  Удалить
                </Button>
              ) : (
                <div> </div>
              )}{" "}
              <Button
                onClick={() => joinRoom(room.jwt)}
                className="h-full col-start-12"
                variant="contained"
              >
                {" "}
                Войти
              </Button>{" "}
            </div>
          ))}
        </div>
      </div>

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
              У вас уже есть созданная комната!
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
