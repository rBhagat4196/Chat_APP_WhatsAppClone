import React , {useEffect} from 'react'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import LeftNav from '@/components/LeftNav';
import Chats from '@/components/Chats';
import Chat from '@/components/Chat';
import Sidebar from '@/components/Sidebar';
import { useChatContext } from '@/context/chatContext';
const Index =()=> {
  const {signOut , currentUser , isLoading} = useAuth();
  const router = useRouter();
  const {data} = useChatContext();
  // console.log(data);
  useEffect(()=>{
    if(!isLoading && !currentUser ){
      router.push("/login");
    }
  },[currentUser, isLoading, router]);  
  return !currentUser ? (
    <Loader />
): (
  <div className="bg-c1 flex h-[100vh]">
  <div className="flex w-full shrink-0">
      <LeftNav />
      <div className="flex bg-c2 grow">
          <Sidebar />
          {data.user && <Chat />}
      </div>
  </div>
</div>
  )
}

export default Index