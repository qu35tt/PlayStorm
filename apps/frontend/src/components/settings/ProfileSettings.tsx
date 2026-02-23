import { Separator } from "@/components/ui/separator"
import { Button } from "../ui/button"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/stores/userStore"
import { useState, type ChangeEvent } from "react"
import axios from "axios"
import { ShieldAlert } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useUpdateForm } from "@/hooks/use-update-form";
import { toast } from "sonner"
import { useUser } from "@/context/user-context"
import { queryClient, useProfileData } from "@/lib/query-client"


export function ProfileSettings(){
    const user = useUserStore()
    const user_ = useUser();
    const [buttonOn, setButtonOn] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const {data: userData} = useProfileData();

    const { form, handleSubmit } = useUpdateForm(async (data) => {
        try{
           const isSame = data.password === data.confirmPassword

            if(!isSame) {
                toast.error("Passwords don't match!");
                return;
            }

           axios.put(`${import.meta.env.VITE_API_URL}user/update/${user.userId}`, {
                email: data.email ? data.email : userData.email,
                username: data.username ? data.username : userData.username,
                password: data.password
           }, { headers: { Authorization: `Bearer ${user.token}` } })
           .then(function (response){
                toast.success("Data Updated Succesfully!")
                queryClient.invalidateQueries({ queryKey: ["profile-data", user.userId] });
                user_.setUser(response.data);
                window.location.reload();
           })
           .catch(function (err) {
                console.log(err);
           })
        }
        catch(err){
            console.error(err)
        }
    })

    function handleValueChange(){
        // Get current form values
        const formValues = form.getValues();
        
        // Check if all fields are empty
        const allFieldsEmpty = !formValues.username && 
                            !formValues.email && 
                            !formValues.password && 
                            !formValues.confirmPassword;
        
        // Set button state based on whether fields have content
        setButtonOn(!allFieldsEmpty);
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0] ?? null;

        if (selected) {
            setFile(selected);
            const url = URL.createObjectURL(selected);
            setPreview(url);
        } else {
            setFile(null);
            setPreview(null);
        }
    }

    async function handleFileUpload(){

        setIsUploading(true);

        if (!file) {
            toast.error("No file selected to upload");
            return;
        }

        const formData = new FormData();
        formData.append("file", file, file.name);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}user/upload/${user.userId}`, formData, { headers: { Authorization: `Bearer ${user.token}` } });
            user_.setUser(response.data);
            window.location.reload();
            toast.success("Avatar uploaded Succesfully");
        } catch (err) {
            console.error(err);
        }
    }

    // function handleFileDelete() {
    //     setFile(null);
    //     setPreview(null);
    //     handleFileUpload();
    // }
    
    return(
        <>
            <div className="h-1/4 flex flex-row items-center px-8">
                <div className="relative w-[13rem] h-[13rem] mx-8">
                    <label className="cursor-pointer block w-full h-full rounded-full overflow-hidden hover:border-8 border-cyan-500 transition-all duration-150">
                    <img
                        src={preview || user_.userCredentials?.avatarUrl || "/default_avatar.webp"}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                    />
                    <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    </label>
                </div>
                <Button className="bg-[#3B82F6] text-md w-[8rem] h-[3rem] mx-auto cursor-pointer hover:bg-[#06B6D4] border-0" disabled={isUploading} onClick={handleFileUpload}>Upload avatar</Button>
            </div>
            <Separator className="bg-gray-400/70"/>
            
            <div className="w-full h-[5rem] bg-[#06B6D4] flex items-center justify-center rounded-md my-8">
                <ShieldAlert className="w-[3rem] h-[4rem] text-black"/>
                <h2 className="text-center text-black font-semibold">U can change details by clicking in box and type new ones. Then click save changes.</h2>
            </div>

            <div className="px-8 py-4">
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* First row - Username and Email */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <FormField 
                                control={form.control} 
                                name="username"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-md">Username</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                className="bg-[#0E111A] h-[3rem] focus:placeholder:text-transparent placeholder:font-bold" 
                                                type="text" 
                                                placeholder={userData ? userData.username : "Enter username..."}
                                                onKeyUp={handleValueChange}
                                                required={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField 
                                control={form.control} 
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-md">Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                className="bg-[#0E111A] h-[3rem] focus:placeholder:text-transparent placeholder:font-bold" 
                                                type="email" 
                                                placeholder={userData ? userData.email : "Enter email..."}
                                                onKeyUp={handleValueChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Second row - Password fields */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <FormField 
                                control={form.control} 
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-md">New Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                className="bg-[#0E111A] h-[3rem] focus:placeholder:text-transparent placeholder:font-bold" 
                                                type="password" 
                                                placeholder="Enter new password..."
                                                onKeyUp={handleValueChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField 
                                control={form.control} 
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-md">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                className="bg-[#0E111A] h-[3rem] focus:placeholder:text-transparent placeholder:font-bold" 
                                                type="password" 
                                                placeholder="Confirm new password..."
                                                onKeyUp={handleValueChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-center pt-4">
                            {buttonOn && <Button 
                                type="submit" 
                                className="bg-[#3B82F6] text-xl w-[10rem] h-[4rem] cursor-pointer hover:bg-[#06B6D4]"
                            >
                                Save Changes!
                            </Button>}
                        </div>
                    </form>
                </Form>
            </div>
        </>
    )
}