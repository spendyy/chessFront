"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";

import Chessground from "@react-chess/chessground";

import Link from "next/link";
import { io } from "socket.io-client";
import axios from "axios";
import { Chess } from "chess.js";

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";

export default function Main() {
  const [messages, setMessages] = useState<[...any]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [role, Setrole] = useState<number>(0);
  const [avatar, setAvatar] = useState<string>("");
  const [avatar1, setAvatar1] = useState<string>("");
  const [avatar2, setAvatar2] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [rating1, setRating1] = useState<number>(0);
  const [rating2, setRating2] = useState<number>(0);
  const [name1, setName1] = useState<string>("");
  const [name2, setName2] = useState<string>("");
  const [name, Setname] = useState<string>("");

  const [game, setGame] = useState(new Chess());
  const [currentPlayer, setCurrentPlayer] = useState("white");

  const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_LINK}`);
  const id = window.location.pathname.split("/")[2];

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/joinroom/${id}`)
      .then((res) => {
        setAvatar1(res.data.player1_img);
        setAvatar2(res.data.player2_img);
        setRating1(res.data.player1_rating);
        setRating2(res.data.player2_rating);
        setName1(res.data.player1);
        setName2(res.data.player2);
      });

    const token = localStorage.getItem("token");

    const mainInfoGet = async () =>
      await axios
        .post(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/verify`, { token })
        .then((response) => {
          if ("Пользователь не авторизован" === response.data) {
            localStorage.clear();
            window.location.href = "/";
          }
          Setname(response.data.username);
          setRating(response.data.elo);
          setAvatar(response.data.image_url);
          Setrole(response.data.role_id);
        });
    mainInfoGet();

    socket.on("needreload", (msg) => {
      if (msg.is_active === false) {
        socket.emit("needreload2", name1);
        window.location.reload();
      }
      return () => socket.disconnect();
    });

    socket.on("move", (igra, imya1, imya2) => {
      console.log(imya1, imya2, name);
      console.log(name);
      if (name === imya1 || name === imya2) {
        setGame(new Chess(igra));
        setCurrentPlayer(game.turn() === "w" ? "black" : "white");
        return () => socket.disconnect();
      }
    });
  }, [name]);

  React.useEffect(() => {
    socket.on("message", (msg) => {
      setMessages([...messages, msg]);
      return () => socket.disconnect();
    });
  }, [messages]);

  const sendMessage = () => {
    socket.emit("message", `${name + ":"} ${newMessage}`);
    setNewMessage("");
  };

  const handleMove = (orig: string, dest: string) => {
    const move = { from: orig, to: dest };
    try {
      const legalMove = game.move(move);
      if (legalMove) {
        socket.emit("move", game.fen(), name1, name2);
      }
    } catch {
      alert("Неверные координаты");
      window.location.reload();
    }
  };

  const avatarPick = () => (avatar1 === avatar ? avatar2 : avatar1);

  return (
    <div onClick={() => console.log(name)} className="grid grid-cols-12">
      <Link href={"/main"}>
        <Button variant="contained" className="ml-2 mt-2">
          Выйти
        </Button>
      </Link>
      <div className="col-span-2 col-start-10 row-start-1 my-auto">
        <h1>Чат</h1>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>

      <div className="flex flex-col bg-slate-400 items-center col-start-4 col-span-6 ">
        <div className="flex flex-row mb-2 mt-4">
          <img
            width={75}
            height={75}
            className="rounded-3xl mt-2 object-cover"
            src={
              avatarPick() === null
                ? "https://pngset.com/images/avatar-icons-person-cushion-camera-electronics-transparent-png-2376333.png"
                : process.env.NEXT_PUBLIC_BACKEND_LINK +
                  avatarPick()?.slice(0, -1)
            }
          ></img>
          <div className="ml-2">
            <p> {name1 === name ? name2 : name1}</p>
            <p>Рейтинг: {rating1 === rating ? rating2 : rating1}</p>{" "}
          </div>
        </div>
        <Chessground
          width={700}
          height={700}
          config={{
            lastmove: true,
            fen: game.fen(),
            orientation: name1 === name ? "white" : "black",
            turnColor: currentPlayer,
            movable: {
              free: true,
              color: name1 === name ? "white" : "black",
            },
            events: {
              move: (orig, dest) => handleMove(orig, dest),
            },
          }}
        />
        <div className="flex flex-row mb-2 mt-2">
          <img
            width={75}
            height={75}
            className="rounded-3xl mt-2 object-cover"
            src={
              avatar?.slice(0, -1) === undefined
                ? "https://pngset.com/images/avatar-icons-person-cushion-camera-electronics-transparent-png-2376333.png"
                : process.env.NEXT_PUBLIC_BACKEND_LINK + avatar?.slice(0, -1)
            }
          ></img>
          <div className="ml-2">
            <p> {name}</p>
            <p>Рейтинг: {rating}</p>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
