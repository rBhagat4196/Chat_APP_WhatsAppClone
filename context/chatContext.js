import { createContext , useContext , useReducer, useState } from "react";
import { useAuth } from "./authContext";
const ChatContext = createContext();

export const ChatContextProvider =({children})=>{
    const [users,setUsers] = useState(false);
    const {currentUser} = useAuth();
    const [chats,setChats] = useState({});
    const [selectedChat,setSelectedChat]=useState(false);
    const [inputText , setInputText] = useState("")
    const [attachment , setAttachment] = useState();
    const [attachmentPreview , setAttachmentPreview] = useState(null);
    const [editMsg , setEditMsg] = useState(null);
    const [isTyping , setIsTyping] = useState(null);
    const [imageViewer , setImageViewer] = useState(null); 

    const initialStates ={
        chatId : "",
        user : null
    }
    
    const resetFooterStates=()=>{
        setInputText("")
        setAttachment(null)
        setAttachmentPreview(null)
        // editMsg(null)
        setImageViewer(null)
    }
    const chatReducer = (state, action) => {
        switch (action.type) {
            case "CHANGE_USER":
                return {
                    user: action.payload,
                    chatId:
                        currentUser.uid > action.payload.uid
                            ? currentUser.uid + action.payload.uid
                            : action.payload.uid + currentUser.uid,
                };
            case "EMPTY":
                return initialStates;
            default:
                return state;
        }
    };
    const [state,dispatch] = useReducer(chatReducer,initialStates);
    return (
        <ChatContext.Provider
        value={{
            users,
            setUsers,
            data : state,
            dispatch,
            chats,
            setChats,
            selectedChat,
            setSelectedChat,
            inputText , 
            setInputText,
            attachment , 
            setAttachment,
            attachmentPreview,
            setAttachmentPreview,
            editMsg , 
            setEditMsg,
            isTyping , 
            setIsTyping,
            imageViewer , 
            setImageViewer,
            resetFooterStates
        }}>
            {children}
        </ChatContext.Provider>
    )
};

export const useChatContext =()=>useContext(ChatContext);