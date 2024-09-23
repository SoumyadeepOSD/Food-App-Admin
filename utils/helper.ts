/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
const validateAndSetFile = (file: File, setImageFile:any) => {
    if (file.size > MAX_FILE_SIZE) {
        toast({
            title: 'File size too large',
            description: `The file size is ${Math.round(file.size / 1024 / 1024)} MB. Maximum allowed size is 10 MB.`,
            variant: 'destructive',
        });
    } else {
        setImageFile(file);
        toast({
            title: 'File selected',
            description: `You selected ${file.name}`,
        });
    }
};


export {validateAndSetFile};