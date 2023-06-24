import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/authContext";
import { db } from "@/firebase/firebase";
import {
    collection,
    doc,
    onSnapshot,
    query,
    Timestamp,
    where,
    getDoc,
    updateDoc,
} from "firebase/firestore";
import { useChatContext } from "@/context/chatContext";
import Avatar from "./Avatar";
import { RiSearch2Line } from "react-icons/ri";
import { formatDate } from "@/utils/helpers";

const Chats = () => {
    const [search, setSearch] = useState("");
    const [unreadMsgs, setUnreadMsgs] = useState({});

    const { currentUser } = useAuth();
    const {
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        users,
        setUsers,
        data,
        dispatch,
        resetFooterStates,
    } = useChatContext();


    const isBlockExecutedRef = useRef(false)
    const isUsersFetchedRef = useRef(false)


    useEffect(()=>{
      resetFooterStates();
    },[data?.chatId])

    useEffect(() => {
        onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = {};
            snapshot.forEach((doc) => {
                updatedUsers[doc.id] = doc.data();
            });
            setUsers(updatedUsers);
            if(!isBlockExecutedRef.current){
              isUsersFetchedRef.current = true
            }
        });
    }, []);



    useEffect(()=>{
      const docId = Object.keys(chats);
      if(docId.length === 0) return;
      const q = query(
        collection(db,"chats"),
        where("__name__","in",docId)
      )

      const unsub = onSnapshot(q,(snapshot)=>{
        let msg ={}
        snapshot.forEach((doc)=>{
          if(doc.id != data.chatId){
            msg[doc.id]=doc.data().messages.filter((m)=>m?.read===false &&
            m?.sender !== currentUser.uid)
          }
          Object.keys(msg || {}).map((c)=>{
            if(msg[c]?.length < 1){
              delete msg[c];
            }
          });
        });
        setUnreadMsgs(msg)
      });
      return ()=>unsub();
    },[chats,selectedChat])



    useEffect(()=>{
      const getChats =()=>{
        const unsub = onSnapshot(doc(db,"userChats",currentUser.uid),(doc)=>{
          if(doc.exists()){
            const data = doc.data();
            setChats(data);
            if(!isBlockExecutedRef.current && isUsersFetchedRef.current && users){
              const firstChat = Object.values(data).filter(
                chat => !chat.hasOwnProperty("chatDeleted")
              ).sort
              ((a,b)=> b.date - a.date)[0]

              if(firstChat){
                const user = users[firstChat?.userInfo?.uid]
                handleSelect(user);
                
                const chatId = currentUser.uid >
                user.uid ? currentUser.uid + user.uid :
                user.uid + currentUser.uid
                readChat(chatId)
              }
              isBlockExecutedRef.current = true
            }
          }
        })
      }
      currentUser.uid && getChats();
    },[isBlockExecutedRef.current,users])


    const filteredChats = Object.entries(chats || {})
        .filter(([, chat]) => !chat?.hasOwnProperty("chatDeleted"))
        .filter(
            ([, chat]) =>
                chat?.userInfo?.displayName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                chat?.lastMessage?.text
                    .toLowerCase()
                    .includes(search.toLowerCase())
        )
        .sort((a, b) => b[1].date - a[1].date);
    // console.log(filteredChats);
    // console.log(users)
    const handleSelect = (user,selectedChatId)=>{
      setSelectedChat(user);
      dispatch({type : "CHANGE_USER" , payload : user })
      // console.log(selectedChat)
      if(unreadMsgs?.[selectedChatId]?.length > 0){
        console.log(unreadMsgs)
        readChat(selectedChatId)
      }
    }

  const readChat = async (chatId) => {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      let updatedMessages = chatDoc.data().messages.map((message) => {
          if (message?.read === false) {
              message.read = true;
          }
          return message;
      });
      await updateDoc(chatRef, { messages: updatedMessages });
  };

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 sticky -top-[20px] z-10 flex justify-center w-full bg-c2 py-5">
                <RiSearch2Line className="absolute top-9 left-12 text-c3" />
                <input
                    type="Text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search username..."
                    className="w-[300px] h-12 rounded-xl bg-c1/[0.5] pl-11 pr-5 placeholder:text-c3 outline-none text-base"
                />
            </div>
            <ul className="flex flex-col w-full my-5 gap-[2px]">
              {
                Object.keys(users || {}).length > 0 && filteredChats?.map((chat)=>{
                  const timeStamp = new Timestamp(
                    chat[1].date?.seconds,
                    chat[1].date?.nanoseconds
                  ) || new Date();
                  const date = timeStamp.toDate(); 
                  const user = users[chat[1].userInfo.uid];
                  return (
                    <li
                    key = {chat[0]}
                    onClick={()=>handleSelect(user,chat[0])}
                    className={`h-[90px] flex items-center gap-4 rounded-3xl hover:bg-c1 p-4 cursor-pointer ${
                      selectedChat?.uid === user.uid
                          ? "bg-c1"
                          : ""
                  }`}>
                    <Avatar size="x-large" user={user} />
                    <div className="flex flex-col gap-1 grow relative">
                        <span className="text-base text-white flex  items-center justify-between">
                            <div className="font-medium">
                                {user?.displayName}
                            </div>
                            <div className="text-xs text-c3">
                                {formatDate(date)}
                            </div>
                        </span>
                        <p className="text-sm text-c3 line-clamp-1 break-all">
                            {chat[1]?.lastMessage?.text || (chat[1]?.lastMessage?.img && "image")||
                            "Send First Message"}
                        </p>
                        {!!unreadMsgs?.[chat[0]]?.length && (
                            <span className="absolute right-0 top-7 min-w-[20px] h-5 rounded-full bg-red-500 flex justify-center items-center text-sm">
                               { unreadMsgs?.[chat[0]]?.length }
                            </span>
                        )}
                    </div>
                </li>
                  )
                })
              }
                           
            </ul>
        </div>
    );
};

export default Chats;