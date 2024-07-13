import { ClipboardCheck, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { useUploadCodeMutation } from "@/redux/slices/api"
import { toast } from "sonner"
import { useState } from "react"

export default function ShareLink({ children }: { children: React.ReactElement }) {
    const data = useSelector((state: RootState) => state.compilerSlice);
    const [start, setStart] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [shareableLink, setShareableLink] = useState<string>("");
    const [upload, { isLoading }] = useUploadCodeMutation();
    const [copied, setCopied] = useState<boolean>(false);
    const [codeId,setCodeId] = useState<number>(0);
    const handleUpload = async () => {
        try {
            setStart(true);
            let res = await upload({ language: data.currentLanguage, code: data.code[data.currentLanguage], message }).unwrap();
            if (res.success) { 
                setCodeId(res.codeId)
                setShareableLink(`https://code-plumber.vercel.app/compiler/receive?id=${res.codeId}`)
            }
            else {
                toast.warning('Error while uploading Code!!');
            }
        }catch(err){
            toast.error('Error while uploading Code!!');
        }
    }
    const handleCopied = () => {
        setCopied(true);
        navigator.clipboard.writeText(shareableLink);
        setTimeout(() => {
            setCopied(false);
        }, 5000)
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                        Link is only valid for 10 minutes.
                    </DialogDescription>
                </DialogHeader>
                {start
                    ?
                    (
                        shareableLink.length ?
                        <>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">
                                        Link
                                    </Label>
                                    <Input
                                        id="link"
                                        defaultValue={shareableLink}
                                        readOnly
                                    /> 
                                </div>
                                {
                                    copied ?
                                        <Button onClick={handleCopied} type="submit" size="sm" className="px-3">
                                            <span className="sr-only">Copied</span>
                                            <ClipboardCheck className="h-4 w-4" />
                                        </Button>
                                        :
                                        <Button onClick={handleCopied} type="submit" size="sm" className="px-3">
                                            <span className="sr-only">Copy</span>
                                            <Copy className="h-4 w-4" />
                                        </Button>

                                }
                            </div>
                            <p className="text-center text-gray-300">Or</p>
                            <div className="flex items-center">
                            <span className="w-1/3">Code Id: </span>
                            <Input type="number"  value={codeId} readOnly  />  
                            </div>
                            </>
                            :
                            (
                                isLoading ?
                                    <h1>Genrating Shareable Link...</h1>
                                    :
                                    <h1>No Link Avalible</h1>
                            )
                    )
                    :
                    <div>
                        <Input onChange={e => setMessage(e.target.value)} placeholder="Write Any Message Here..." />
                    </div>
                }
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    {
                        !start &&
                        <Button onClick={handleUpload} type="button" className="text-gray-700" variant="success">
                            Genrate Link
                        </Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
