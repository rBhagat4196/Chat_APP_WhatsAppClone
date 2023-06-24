import React, { useState } from 'react'
import Icon from './Icon'
import {CgAttachment} from "react-icons/cg"
import {HiOutlineEmojiHappy} from "react-icons/hi"
import Composer from './Composer'
import EmojiPicker from 'emoji-picker-react'
import ClickAwayListener from 'react-click-away-listener'
import { useChatContext } from '@/context/chatContext'
import Image from 'next/image'
import { IoClose } from 'react-icons/io5'
import { MdDeleteForever } from 'react-icons/md'
import { useAuth } from '@/context/authContext'
const ChatFooter = () => {
  const [showEmojiPicker , setShowEmojiPicker] = useState(false)
  const {inputText,
         setInputText,
         data,
         editMsg,
         setEditMsg,
         isTyping,
         attachment,
         setAttachment,
         attachmentPreview,
         setAttachmentPreview,
        } = useChatContext();
        // 
        const {currentUser} = useAuth();
  const onEmojiClick = (emojiData , event)=>{
    // console.log(emojiData)
    let text = inputText+emojiData.emoji;
    setInputText(text)
  };

  const onFileChange =(e)=>{
    const file = e.target.files[0];
    setAttachment(file)
    console.log(file)
    console.log(attachment)
    if(file){
      const blobUrl = URL.createObjectURL(file)
      // console.log(blobUrl)
      setAttachmentPreview(blobUrl);
    }
    // console.log(attachmentPreview);
  }

  return (
    <div className="flex items-center bg-c1/[0.5] p-2 rounded-3xl relative">
      {attachmentPreview && (
                <div className="absolute w-[100px] h-[100px] bottom-16 left-0 bg-c1 p-2 rounded-md">
                    <Image
                         height= {30}
                         width={30}
                         alt="preview"
                        src={attachmentPreview}
                        className="w-full h-full object-contain object-center"
                    />
                    <div
                        className="w-6 h-6 rounded-full bg-red-500 flex justify-center items-center absolute -right-2 -top-2 cursor-pointer"
                        onClick={() => {
                            setAttachment(null);
                            setAttachmentPreview(null);
                        }}
                    >
                        <MdDeleteForever size={14} />
                    </div>
                </div>
            )}
      <div className="shrink-0">
        <input
          type="file"
          id = "fileUploader"
          className="hidden"
          onChange={onFileChange}
        />
        <label htmlFor="fileUploader">
          <Icon
              size="large"
              icon={<CgAttachment size={20}/>}
              className="text-c3"
          />

        </label>
      </div>
      <div className="shrink-0 relative">
        <Icon
            size="large"
            className={''}
            icon={<HiOutlineEmojiHappy 
              size={24}
              className="text-c3"/>
            }
            onClick={()=>setShowEmojiPicker(!showEmojiPicker)}
        />

          {showEmojiPicker && (
            <ClickAwayListener
              onClickAway={()=>setShowEmojiPicker(false)}
            >

        <div className="absolute bottom-12 left-0 shadow-lg">
         <EmojiPicker
          emojiStyle='native'
          theme='light'
          onEmojiClick={onEmojiClick}
          autoFocusSearch = {false}
        />
        </div>
            </ClickAwayListener>

          )}

      </div>
      {
      isTyping  && (

      <div className="absolute -top-6 left-4 bg-c2/[0.5] w-full h-6">
        <div className="flex gap-2 w-full h-full opacity-50
        text-sm text-white ">
          {`${data?.user?.displayName} is typing`}
          <Image src='/typing.svg'
            alt='user'
            width={12}
            height={12}
          />
        </div>

      </div>
      )
      // const chatId=
    } 

      <Composer/>
    </div>
  )
}

export default ChatFooter
