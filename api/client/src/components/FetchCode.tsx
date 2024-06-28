import { ChangeEvent, Ref, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useLazyFetchCodeQuery } from "@/redux/slices/api";
import Loader from "./Loader/Loader";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateCodeValue, updateCurrentLanguage } from "@/redux/slices/compilerSlice";

const FetchCode = () => {
	const [urlSearchParams] = useSearchParams();
	const [codeId, setCodeId] = useState<number>(+(urlSearchParams.get('id') as string));
	const [loading, setLoading] = useState<boolean>(false);
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setCodeId(+e.target.value);
	}
	const navigator = useNavigate();
	const dispatch = useDispatch();
	const [fetchcode, { isError }] = useLazyFetchCodeQuery();
	const InputRef = useRef<HTMLInputElement>();
	const handleFetch = async () => {
		try {
			setLoading(true);
			let { data,error, success } = await fetchcode({ codeId }).unwrap();
			if (success && !isError) {
				if(!error){
					dispatch(updateCurrentLanguage(data.language))
					dispatch(updateCodeValue(data.code));
					console.log(data.message)
					handleClose();
				}
				else{
					toast.warning("Error! may be expired key!")
				}
			}
			else {
				toast.warning("Error during code fetching...");
			}
			setLoading(false)
		} catch (err) {
			toast.warning("Error during code fetching...");
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		if (codeId != 0) {
			if(InputRef.current)
				InputRef.current.value = ''+codeId
			handleFetch();
		}
	}, [])
	const handleClose = () => {
		navigator('/compiler');
	}
	const helpHandleClose = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
		e.stopPropagation();
	}

	return (
		<div onClick={handleClose} className="absolute w-full h-[calc(100dvh-60px)] backdrop-blur-sm" style={{ zIndex: 100000000 }}>
			<div onClick={helpHandleClose} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
				<Card className="w-[350px]">
					<CardHeader>
						<CardTitle>Fetch Code</CardTitle>
						<CardDescription>Enter the Code Id shared by user</CardDescription>
					</CardHeader>
					{
						loading ?
							<div className="pb-4 px-4">
								<Loader />
							</div>
							:
							<CardContent>
								<form>
									<div className="grid w-full items-center gap-4">
										<div className="flex flex-col space-y-1.5">
											<Label htmlFor="name">Code Id</Label>
											<Input ref={InputRef as Ref<HTMLInputElement>} onChange={handleChange} type="number" id="codeId" placeholder="99999" />
										</div>
									</div>
								</form>
							</CardContent>
					}
					<CardFooter className="flex justify-between">
						<Button onClick={handleClose} variant="outline">Cancel</Button>
						<Button disabled={loading} onClick={handleFetch}>Fetch</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}

export default FetchCode;