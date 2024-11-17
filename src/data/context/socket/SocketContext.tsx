"use client";

import { createContext, useEffect, useState } from "react";

import { message } from "antd";
import { Manager, Socket } from "socket.io-client";

import { ICustomerUploadTemplateFileError } from "../../../shared/business/customers/customers.type";
import useAuthData from "../auth/useAuthData";

export interface ISocketContext {
  socket: Socket | null;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
});

export const SocketProvider = ({ children }: { children?: any }) => {
  const { employee, isLogged } = useAuthData();

  const [socket, setSocket] = useState<Socket | null>(null);

  const socketOnInitialListeners = (socket: Socket) => {
    socket?.on("connect", () => {
      console.log("Connected to WebSocket server");

      socket?.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    });
  };

  const socketOffInitialListeners = (socket: Socket) => {
    socket?.off("connect");
    socket?.off("disconnect");
  };

  const connectSocket = (): void => {
    try {
      const manager = new Manager(process.env.NEXT_PUBLIC_URL_SOCKET_IO, {
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        reconnection: true,
        multiplex: false,
        query: {},
      });

      const socketInstance: Socket = manager.socket(
        process.env.NEXT_PUBLIC_MANAGER_SOCKET_IO_PATH!
      );

      setSocket(socketInstance);
      socketOnInitialListeners(socketInstance);
    } catch (error) {
      throw error;
    }
  };

  const disconnectSocket = (): void => {
    socketOffInitialListeners(socket!);
    socket?.disconnect();
  };

  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (socket?.connected && employee && isLogged) {
      socket.on(
        `upload-customers-response-to-employee-${employee._id}`,
        (data: ICustomerUploadTemplateFileError[]) => {
          if (data.length > 0) {
            message.error(
              "Upload Customers Error on some file, please check on customer upload table!"
            );
          } else {
            message.info("Upload Customers Completed!");
          }
        }
      );
    }
  }, [socket, employee, isLogged]);

  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
