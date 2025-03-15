"use client";

import { createContext, useEffect, useState } from "react";

import { message } from "antd";
import { Manager, Socket } from "socket.io-client";

import { ICustomerFileUploadTemplateRow } from "../../../shared/business/customers/customers.type";
import { IEmployeeFileUploadTemplateRow } from "../../../shared/business/employees/employees.types";
import { IFileUploadTemplateError } from "../../../shared/business/files-uploads/files-uploads.type";
import { IProductFileUploadTemplateRow } from "../../../shared/business/products/products.type";
import SocketsEnum from "../../../shared/business/sockets/sockets.enum";
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
      if (socket?.connected) {
        return;
      }

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
    if (socket?.connected && employee?._id && isLogged) {
      // Customers
      socket.on(
        SocketsEnum.EventNames.UPLOAD_CUSTOMERS_RESPONSE_TO_EMPLOYEE(
          employee._id
        ),
        (data: IFileUploadTemplateError<ICustomerFileUploadTemplateRow>[]) => {
          if (data.length > 0) {
            message.warning(
              "Upload Customers has completed but there are error on some file, please check on customers upload table!"
            );
          } else {
            message.success("Upload Customers Completed!");
          }
        }
      );

      // Products
      socket.on(
        SocketsEnum.EventNames.UPLOAD_PRODUCTS_RESPONSE_TO_EMPLOYEE(
          employee._id
        ),
        (data: IFileUploadTemplateError<IProductFileUploadTemplateRow>[]) => {
          if (data.length > 0) {
            message.warning(
              "Upload Products has completed but there are error on some file, please check on products upload table!"
            );
          } else {
            message.success("Upload Products Completed!");
          }
        }
      );

      // Employees
      socket.on(
        SocketsEnum.EventNames.UPLOAD_EMPLOYEES_RESPONSE_TO_EMPLOYEE(
          employee._id
        ),
        (data: IFileUploadTemplateError<IEmployeeFileUploadTemplateRow>[]) => {
          if (data.length > 0) {
            message.warning(
              "Upload Employees has completed but there are error on some file, please check on employees upload table!"
            );
          } else {
            message.success("Upload Employees Completed!");
          }
        }
      );

      // Sales
      socket.on(
        SocketsEnum.EventNames.UPLOAD_SALES_RESPONSE_TO_EMPLOYEE(employee._id),
        (data: IFileUploadTemplateError<IEmployeeFileUploadTemplateRow>[]) => {
          if (data.length > 0) {
            message.warning(
              "Upload Sales has completed but there are error on some file, please check on sales upload table!"
            );
          } else {
            message.success("Upload Sales Completed!");
          }
        }
      );
    }
  }, [socket, employee?._id, isLogged]);

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
