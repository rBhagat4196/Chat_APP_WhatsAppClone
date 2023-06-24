import { useAuth } from '@/context/authContext';
import { useChatContext } from '@/context/chatContext'
import { db ,storage} from '@/firebase/firebase';
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc,getDoc, deleteField } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React from 'react'
import {TbSend} from "react-icons/tb"
import { v4 as uuid } from 'uuid';
const Composer = () => {
  const {inputText,setInputText,data,attachment,
    setAttachment,setAttachmentPreview} = useChatContext();
  const {currentUser} = useAuth();
  let timeout = null

  
  const handleTyping = async(e)=>{
    setInputText(e.target.value)
    await updateDoc(doc(db,"chats",data.chatId),{
        [`typing.${currentUser.uid}`]:true
    })
    if(timeout){
        clearTimeout(timeout)
    }
    timeout = setTimeout(async()=>{
        await updateDoc(doc(db,"chats",data.chatId),{
            [`typing.${currentUser.uid}`] : false
        });
        timeout=null
    },500)
  }


  const onKeyUp =(e)=>{
    // e.preventDefault();
    if(e.key === "enter" && (inputText || attachment)){
      handleSend();
    }
  }

  const handleSend = async () => {
    // console.log(attachment)
    if (attachment) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, attachment);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
                switch (snapshot.state) {
                    case "paused":
                        console.log("Upload is paused");
                        break;
                    case "running":
                        console.log("Upload is running");
                        break;
                }
            },
            (error) => {
                console.error(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(
                    async (downloadURL) => {
                        await updateDoc(doc(db, "chats", data.chatId), {
                            messages: arrayUnion({
                                id: uuid(),
                                text: inputText,
                                sender: currentUser.uid,
                                date: Timestamp.now(),
                                img: downloadURL,
                                read: false,
                            }),
                        });
                    }
                );
            }
        );
    } else {
        await updateDoc(doc(db, "chats", data.chatId), {
            messages: arrayUnion({
                id: uuid(),
                text: inputText,
                sender: currentUser.uid,
                date: Timestamp.now(),
                read: false,
            }),
        });
    }

    let msg = { text: inputText };
    if (attachment) {
        msg.img = true;
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
        [data.chatId + ".lastMessage"]: msg,
        [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: msg,
        [data.chatId + ".date"]: serverTimestamp(),
        [data.chatId + ".chatDeleted"]: deleteField(),
    });

    setInputText("");
    setAttachment(null);
    setAttachmentPreview(null);
};


  return (
    <div className="flex items-center gap-2 grow">
      <input
          type='text'
          className="grow w-full outline-0 px-2 py-2 text-white
          bg-transparent placeholder:text-c3 outline-none text-base
          "
          placeholder='Start the Chat'
          value={inputText}
          onKeyUp={onKeyUp}
          onChange={handleTyping}
      />
      <button className={`h-10 w-10 rounded-xl shrink-0 flex justify-center items-center
      ${inputText.trim().length > 0 ? "bg-c4" : ""} `}
      onClick={handleSend}
      >
        <TbSend size={20}/>
      </button>
    </div>
  )
}

export default Composer
