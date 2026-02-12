import { IsEmail, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    name:string;
    @IsString()
    @IsEmail()
    email:string;
    @IsString()
    password:string;
}

export class LoginDto {
    @IsString()
    @IsEmail()
    email:string;
    @IsString()
    password:string;
}
