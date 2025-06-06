import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { convertStringToObjectId } from 'src/utils/helper';

export class CreateConversationDto {
    @SuperApiProperty({
        type: String,
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => convertStringToObjectId(value))
    senderId: Types.ObjectId;

    @SuperApiProperty({
        type: String,
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => convertStringToObjectId(value))
    receiverId: Types.ObjectId;
}
