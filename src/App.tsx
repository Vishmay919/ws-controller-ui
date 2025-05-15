import React, { useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Button,
  Grid,
  Slider,
  TextField,
  Typography,
} from "@mui/material";

const socket = io("https://remote-control-server-ehjj.onrender.com", {
  auth: {
    role: "controller",
    pairingCode: prompt("Enter pairing code:") || "",
  },
  transports: ["websocket"],
});

export default function ControllerApp() {
  const [key, setKey] = useState("");
  const last = useRef({ x: 0, y: 0 });

  const handleKeySend = () => {
    if (key) {
      socket.emit("command", { type: "keypress", payload: { key } });
      setKey("");
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - last.current.x;
    const dy = touch.clientY - last.current.y;
    last.current = { x: touch.clientX, y: touch.clientY };

    socket.emit("command", {
      type: "mouse_move",
      payload: { x: window.innerWidth / 2 + dx, y: window.innerHeight / 2 + dy },
    });
  };

  return (
    <div>
      <div>
        <div>
          <TextField
            label="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleKeySend()}
          />
          <Button variant="contained" onClick={handleKeySend} sx={{ ml: 2 }}>
            Send
          </Button>
        </div>

        <div>
          <Box
            width={300}
            height={150}
            bgcolor="#eee"
            borderRadius={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              last.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchMove={handleTouchMove}
          >
            <Typography color="textSecondary">Touchpad</Typography>
          </Box>
        </div>

        <div>
          <Grid container spacing={2}>
            <div>
              <Button
                variant="outlined"
                onClick={() =>
                  socket.emit("command", {
                    type: "mouse_click",
                    payload: { button: "left" },
                  })
                }
              >
                Left Click
              </Button>
            </div>
            <div>
              <Button
                variant="outlined"
                onClick={() =>
                  socket.emit("command", {
                    type: "mouse_click",
                    payload: { button: "right" },
                  })
                }
              >
                Right Click
              </Button>
            </div>
          </Grid>
        </div>

        <div>
          <Typography variant="caption">Scroll</Typography>
          <Slider
            defaultValue={0}
            min={-100}
            max={100}
            onChange={(_e, value) =>
              socket.emit("command", {
                type: "scroll",
                payload: { x: 0, y: value as number },
              })
            }
          />
        </div>
      </div>
      </div>
  );
}
