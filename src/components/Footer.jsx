import React from "react";
import { PiFacebookLogoDuotone } from "react-icons/pi";
import { PiLinkedinLogoDuotone } from "react-icons/pi";
import { PiInstagramLogoDuotone } from "react-icons/pi";
import { PiTwitterLogoDuotone } from "react-icons/pi";

const Footer = () => {
  return (
    <div className="backdrop-blur-2xl bg-indigo-100/30">
      <footer class="flex flex-col space-y-10 justify-center p-10">
        <div class="flex justify-center text-4xl text-indigo-900 space-x-5">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiFacebookLogoDuotone />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiLinkedinLogoDuotone />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiInstagramLogoDuotone />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiTwitterLogoDuotone />
          </a>
        </div>
        <p class="text-center text-gray-700 font-medium">
          &copy; © 2025 Tuwaiq Project Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
