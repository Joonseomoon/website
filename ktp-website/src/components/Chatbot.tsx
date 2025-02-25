import { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { DialogActions, Popover } from "@mui/material";
import ChatbotDialog from "./ChatbotDialog";
import SettingsIcon from "@mui/icons-material/Settings";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { ChatbotContext } from "../contexts/ChatbotContext";

const rag_agent_url = import.meta.env.VITE_RAG_AGENT_FUNCTION_URL;
const react_agent_url = import.meta.env.VITE_REACT_AGENT_FUNCTION_URL;

const Chatbot = () => {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error("Chatbot must be used within a ChatbotProvider");
    }
    const [state, dispatch] = context;
    const [loading, setLoading] = useState(false);

    /* Handles the settings menu */
    const [settingsMenuAnchorEl, setSettingsMenuAnchorEl] =
        useState<null | HTMLElement>(null);
    const settingsOpen = Boolean(settingsMenuAnchorEl);
    const handleSettingsMenuOpen = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setSettingsMenuAnchorEl(event.currentTarget);
    };
    const handleSettingsMenuClose = () => {
        setSettingsMenuAnchorEl(null);
    };

    /* Handles chatbot mode selection */
    const [modeDialogOpen, setModeDialogOpen] = useState(false);
    const setRagArchitecture = () => {
        dispatch({ type: "setAgent", payload: { agent: "rag" } });
        console.log("Chatbot set to RAG mode");
        setModeDialogOpen(false);
    };
    const setReactArchitecture = () => {
        dispatch({ type: "setAgent", payload: { agent: "react" } });
        console.log("Chatbot set to ReAct mode");
        setModeDialogOpen(false);
    };

    /* Queries the chatbot */
    const queryChatbot = async () => {
        try {
            if (state.query.trim() === "") {
                return;
            }
            setSubmitAnchorEl(null);
            setLoading(true);
            if (state.agent === "rag") {
                const response = await axios.post(`${rag_agent_url}`, {
                    query: state.query,
                    history: state.rag_history,
                });
                console.log(response);
                dispatch({
                    type: "setQuery",
                    payload: { query: "" },
                });
                setLoading(false);
                dispatch({
                    type: "setRAGHistory",
                    payload: { history: response.data.history },
                });
                console.log(state.rag_history);
            } else if (state.agent === "react") {
                const response = await axios.post(`${react_agent_url}`, {
                    query: state.query,
                    history: state.react_history,
                });
                console.log(response);
                dispatch({
                    type: "setQuery",
                    payload: { query: "" },
                });
                setLoading(false);
                dispatch({
                    type: "setReActHistory",
                    payload: { history: response.data.history },
                });
                console.log(state.react_history);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error querying the chatbot:", error);
        }
    };

    /* Adjusts query input textbox sizing */
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height to content's scrollHeight
        }
    }, [state.query]);

    /* Adjusts auto-scroll to end of conversation */
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [state.rag_history, state.react_history]);

    /* Return key to submit, shift key + return key to go to new line */
    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            queryChatbot();
        }
    };

    /* Handles submit button popover */
    const [submitAnchorEl, setSubmitAnchorEl] = useState<HTMLElement | null>(
        null
    );
    const handleSubmitPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
            return;
        }
        setSubmitAnchorEl(event.currentTarget);
    };
    const handleSubmitPopoverClose = () => {
        setSubmitAnchorEl(null);
    };
    const submitPopover = Boolean(submitAnchorEl);

    return (
        <div>
            {/* Chatbot drawer header */}
            <div className="p-2 flex justify-between align-middle sticky top-0 z-10 bg-ktp-darkblue">
                <button
                    onClick={() =>
                        dispatch({
                            type: "closeChatbotDrawer",
                        })
                    }
                >
                    <CloseIcon
                        className="my-auto text-white"
                        fontSize="large"
                    />
                </button>
                <div className="flex">
                    <h2 className="my-auto px-1 text-3xl text-white">KTPaul</h2>
                    <span className="mt-auto px-1 text-lg text-ktp-lightgreen font-semibold uppercase rounded-lg">
                        Beta
                    </span>
                </div>

                {/* Chatbot settings menu */}
                <button onClick={handleSettingsMenuOpen}>
                    <SettingsIcon
                        className="my-auto text-white"
                        fontSize="large"
                    />
                </button>
                <Menu
                    id="settings-menu"
                    anchorEl={settingsMenuAnchorEl}
                    open={settingsOpen}
                    onClose={handleSettingsMenuClose}
                    MenuListProps={{
                        "aria-labelledby": "settings-button",
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            handleSettingsMenuClose();
                            setModeDialogOpen(true);
                        }}
                    >
                        Architecture
                    </MenuItem>
                    <MenuItem onClick={handleSettingsMenuClose}>
                        Overview
                    </MenuItem>
                </Menu>

                {/* Chatbot architecture settings dialog */}
                <Dialog
                    open={modeDialogOpen}
                    onClose={() => setModeDialogOpen(false)}
                    aria-labelledby="mode-dialog-title"
                    aria-describedby="mode-dialog-description"
                >
                    <DialogTitle id="mode-dialog-title">
                        Architecture
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="mode-dialog-description">
                            Configure the chatbot with either the RAG or ReAct
                            agent architecture.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <div className="w-fit m-auto flex flex-wrap justify-around">
                            <button
                                className={`w-36 sm:w-48 mx-1 sm:mx-2 my-1 p-1 rounded-md border-2 border-gray-200 ${
                                    state.agent === "rag" && "bg-gray-200"
                                } hover:bg-ktp-lightgreen`}
                                onClick={setRagArchitecture}
                                autoFocus
                            >
                                Retrieval Augmented Generation (RAG)
                            </button>
                            <button
                                className={`w-36 sm:w-48 mx-1 sm:mx-2 my-1 p-1 rounded-md border-2 border-gray-200 ${
                                    state.agent === "react" && "bg-gray-200"
                                } hover:bg-ktp-lightgreen`}
                                onClick={setReactArchitecture}
                                autoFocus
                            >
                                Synergizing Reasoning and Acting (ReAct)
                            </button>
                        </div>
                    </DialogActions>
                </Dialog>
            </div>

            <p className="w-fit mx-auto mt-4 text-red-500">
                Experimental - please double check responses.
            </p>

            {/* Chatbot drawer conversation history */}
            <div className={`mx-8 ${loading ? "mt-4" : "my-4"}`}>
                {state.agent === "rag" &&
                    state.rag_history.map((message, index) => (
                        <div
                            key={index}
                            className={`w-fit max-w-4/5 my-1 py-1 flex ${
                                message.role === "user" &&
                                "ml-auto px-2 justify-end rounded-md bg-ktp-lightblue"
                            }`}
                        >
                            {message.role === "assistant" && (
                                <SmartToyIcon className="mr-2" />
                            )}
                            {message.content}
                        </div>
                    ))}
                {state.agent === "react" &&
                    state.react_history
                        .filter((message) => message.role !== "system")
                        .map((message, index) => (
                            <div
                                key={index}
                                className={`w-fit max-w-4/5 my-1 py-1 flex ${
                                    message.role === "user" &&
                                    "ml-auto px-2 justify-end rounded-md bg-ktp-lightblue"
                                }`}
                            >
                                {message.role === "assistant" && (
                                    <SmartToyIcon className="mr-2" />
                                )}
                                {message.content}
                            </div>
                        ))}
            </div>

            {!loading ? (
                /* Displays query input textbox and chatbot actions if not loading response */
                <div className="mx-8 my-4 flex flex-col sticky bottom-4 z-10 rounded-md bg-gray-100">
                    {/* Query input textbox */}
                    <textarea
                        ref={textareaRef}
                        id="chatbot-query"
                        className="w-full px-3 py-2 resize-none overflow-hidden border-top rounded-md focus:outline-none focus:border-none bg-gray-100"
                        placeholder="Message KTPaul"
                        value={state.query}
                        onChange={(e) =>
                            dispatch({
                                type: "setQuery",
                                payload: { query: e.target.value },
                            })
                        }
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />

                    {/* Chatbot actions */}
                    <div className="px-2 flex justify-between">
                        <div className="flex">
                            <ChatbotDialog action="clearConversation" />
                            <ChatbotDialog action="downloadTranscript" />
                        </div>

                        {/* Displays submit action if query present */}
                        {state.query !== "" && (
                            <>
                                <button
                                    className="w-fit m-1 rounded-md hover:bg-gray-300"
                                    type="submit"
                                    onClick={queryChatbot}
                                    aria-owns={
                                        submitPopover
                                            ? "mouse-over-popover"
                                            : undefined
                                    }
                                    aria-haspopup="true"
                                    onMouseEnter={handleSubmitPopoverOpen}
                                    onMouseLeave={handleSubmitPopoverClose}
                                    onTouchStart={(e) => e.preventDefault()}
                                >
                                    <ArrowUpwardIcon />
                                </button>
                                <Popover
                                    id="mouse-over-popover"
                                    sx={{ pointerEvents: "none" }}
                                    open={submitPopover}
                                    anchorEl={submitAnchorEl}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "left",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    onClose={handleSubmitPopoverClose}
                                    disableRestoreFocus
                                >
                                    <p className="p-2">Submit</p>
                                </Popover>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* Displays loading icon if loading response */
                <div className="mx-8 mb-4">
                    <div className="w-fit max-w-sm ml-auto my-1 px-2 py-1 flex justify-end rounded-md bg-ktp-lightblue">
                        {state.query}
                    </div>
                    <div className="w-fit max-w-sm my-1 py-1 flex align-top">
                        <SmartToyIcon className="mr-2" />
                        <ThreeDots
                            visible={true}
                            height="25"
                            width="50"
                            color="#000000"
                            radius="9"
                            ariaLabel="three-dots-loading"
                        />
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default Chatbot;
