import React from 'react'
import PopupWrapper from './PopupWrapper'
import { useChatContext } from '@/context/chatContext';
import { useAuth } from '@/context/authContext';
import Avatar from '../Avatar';
import { doc, getDoc, setDoc, updateDoc,serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import Search from '../Search';
import { RiErrorWarningLine } from 'react-icons/ri';
import { DELETED_FOR_ME,DELETED_FOR_EVERYONE } from '@/utils/constants';
const DeletePopup = (props) => {
    const { currentUser } = useAuth();
    const { users, dispatch } = useChatContext();
  return (
    // <div>helllooo</div>
    <PopupWrapper {...props}>
        <div className="mt-10 mb-5">
            <div className="flex items-center justify-center gap-3">
                <RiErrorWarningLine className="text-red-500"/>
                    <div className="text-lg">
                        Are you sure, you want to delete the message ?
                    </div>
                </div>
                <div className="flex item-center justify-center gap-2 mt-10">
                    <button className="border-[2px] border-red-500 py-2
                    px-4 text-sm rounded-md text-green-500 hover:bg-red-400 hover:text-blue-700"
                    onClick={()=>props.deleteMessage(DELETED_FOR_ME)}>
                        Delete For Me
                    </button>
                    {props.self && (
                    <button className="border-[2px] border-red-500 py-2
                    px-4 text-sm rounded-md text-green-500 hover:bg-red-400 hover:text-blue-700"
                        onClick={()=>props.deleteMessage(DELETED_FOR_EVERYONE)}
                    >
                        Delete For Everyone
                    </button>
                    )}
                    <button className="border-[2px] border-blue-500 py-2
                    px-4 text-sm rounded-md text-green-500 hover:bg-green-200 hover:text-blue-700"
                      onClick={props.onHide}
                    >
                        Cancel
                    </button>
                </div>
        </div>
    </PopupWrapper>
  )
}

export default DeletePopup
