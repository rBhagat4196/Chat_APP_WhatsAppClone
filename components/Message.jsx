import { useAuth } from '@/context/authContext'
import React, { useEffect, useRef,useState } from 'react'
import Avatar from './Avatar'
import { useChatContext } from '@/context/chatContext'
import Image from 'next/image'
import ImageViewer from 'react-simple-image-viewer'
import { Timestamp, doc, updateDoc,getDoc } from 'firebase/firestore'
import { formatDate } from '@/utils/helpers'
import {GoChevronDown} from "react-icons/go"
import MessageMenu from './MessageMenu'
import Icon from './Icon'
import DeletePopup from './popup/DeletePopup'
import { db } from '@/firebase/firebase'
import { DELETED_FOR_EVERYONE,DELETED_FOR_ME } from '@/utils/constants'


const Message = ({message}) => {
    const {currentUser} = useAuth()
    const {users,data,imageViewer , setImageViewer} = useChatContext()
    const self = message.sender == currentUser.uid
    const [showMenu,setShowMenu] = useState()
    const [showDeletePopup,setShowDeletePopup]=useState(false)
    const timeStamp = new Timestamp(
      message.date?.seconds,
      message.date?.nanoseconds
    ) || new Date();
    const date = timeStamp.toDate(); 
    const ref = useRef();

    useEffect(()=>{
      ref?.current?.scrollIntoViewIfNeeded();
    },[])

    const deletePopupHandler =()=>{
      setShowDeletePopup(true)
      setShowMenu(false);
    }
    // const user = users[chat[1].userInfo.uid];

    const deleteMessage = async (action) => {
      try {
          const messageID = message.id;
          const chatRef = doc(db, "chats", data.chatId);

          // Retrieve the chat document from Firestore
          const chatDoc = await getDoc(chatRef);

          // Create a new "messages" array that excludes the message with the matching ID
          const updatedMessages = chatDoc.data().messages.map((message) => {
              if (message.id === messageID) {
                  if (action === DELETED_FOR_ME) {
                      message.deletedInfo = {
                          [currentUser.uid]: DELETED_FOR_ME,
                      };
                  }

                  if (action === DELETED_FOR_EVERYONE) {
                      message.deletedInfo = {
                          deletedForEveryone: true,
                      };
                  }
              }
              return message;
          });

          // Update the chat document in Firestore with the new "messages" array
          await updateDoc(chatRef, { messages: updatedMessages });
          setShowDeletePopup(false)
      } catch (err) {
          console.error(err);
      }
  };



  return (
    <div className={`mb-5 max-w-[75%] ${self ?
    "self-end" : "self-start"}`}>
      {showDeletePopup && (
      <DeletePopup
        onHide ={()=>setShowDeletePopup(false)}
        className="DeleteMsgPopup"
        shortHeight={true}
        self={self}
        noHeader={true}
        deleteMessage = {deleteMessage}
      />
      )}
      <div className={`flex item-end gap-3 mb-1
        ${self ? "justify-start" : "flex-row-reverse"}
        
      `}
      ref ={ref}
      >
            <Avatar
                size="small"
                user={self?currentUser: users[
                    data.user.uid
                ]}
                className="mb-4"
            />
            <div className={`group flex flex-col gap-4 p-4
            rounded-3xl relative break-all 
            ${self ? "rounded-br-md bg-c5" : "rounded-bl-md bg-c1" }`}>
                {message.text && (
                    <div>{message.text}</div>
                )}
                {message.img && (
                    <>
                      <Image
                        alt={message?.text || ""}
                        src={message.img}
                        height={250}
                        width={250}
                        className="rounded-3xl max-w-[250px]"
                        onClick={()=>{
                            setImageViewer({
                                msgId : message.id,
                                url: message.img
                            })
                        }}
                      />
                      {imageViewer&&imageViewer.msgId == message.id && (
                        <ImageViewer
                           src={[imageViewer.url]}
                           currentIndex={0}
                           disableScroll={false}
                           closeOnClickOutside={true}
                           onClose={()=>{
                            setImageViewer(null)
                           }}
                        />
                      )}
                    </>
                )}
                <div
                        className={`${
                            showMenu ? "" : "hidden"
                        } group-hover:flex absolute top-2 ${
                            self ? "left-2 bg-c5" : "right-2 bg-c1"
                        }`}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <Icon
                            size="medium"
                            className="hover:bg-inherit rounded-none"
                            icon={
                                <GoChevronDown size={24} className="text-c3" />
                            }
                        />
                        {showMenu && (
                            <MessageMenu
                                self={self}
                                setShowMenu={setShowMenu}
                                showMenu={showMenu}
                                deletePopupHandler={deletePopupHandler}
                                // editMsg={() => setEditMsg(message)}
                            />
                        )}
                    </div>

            </div>
      </div>
      <div className={`flex item-end ${
        self ? "justify-start flex-row-reverse mr-12" : "ml-12"
      }`}>
            <div className="text-xs text-c3">
              {formatDate(date)}
            </div>
      </div>
    </div>
  )
}

export default Message
