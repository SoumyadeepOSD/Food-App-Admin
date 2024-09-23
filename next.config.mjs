/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                hostname:"www.thereciperebel.com"
            },
            {
                hostname:"res.cloudinary.com"
            }
        ]
    }
};

export default nextConfig;
