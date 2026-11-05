"use client";
import dynamic from "next/dynamic";
/** The chat bubble is only needed after a tap, so its code loads after the page is already usable. */
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });
export default ChatWidget;
