"use client";

import { useState } from "react";

import Layout from "../../components/template/Layout/Layout";

export default function Test() {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Layout subtitle="test" title="test-title">
      <div className="flex justify-center">
        <div className="relative my-32">
          <button
            onClick={() => setShow(!show)}
            className="relative z-10 block rounded-md p-2  
          bg-blue-600
           text-gray-200  px-6 text-sm py-3 overflow-hidden 
           focus:outline-none focus:border-white"
          >
            Dropdown
            <svg
              className="h-5 w-5 text-gray-800"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 
              10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          {show && (
            <div
              onClick={() => setShow(false)}
              className="fixed inset-0 h-full w-full z-10"
            ></div>
          )}

          {show && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
              <a
                href="#"
                className="block px-4 py-2 text-sm capitalize text-gray-800 hover:bg-indigo-500 hover:text-white"
              >
                your profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm capitalize text-gray-800 hover:bg-indigo-500 hover:text-white"
              >
                Your projects
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm capitalize text-gray-800 hover:bg-indigo-500 hover:text-white"
              >
                Help
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm capitalize text-gray-800 hover:bg-indigo-500 hover:text-white"
              >
                Settings
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm capitalize text-gray-800 hover:bg-indigo-500 hover:text-white"
              >
                Sign Out
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
