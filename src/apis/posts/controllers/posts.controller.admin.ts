import { PERMISSION, Resource } from '@libs/super-authorize';
import { SuperAuthorize } from '@libs/super-authorize/decorators/authorize.decorator';
import { SuperDelete } from '@libs/super-core/decorators/super-delete.decorator';
import { SuperGet } from '@libs/super-core/decorators/super-get.decorator';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { SuperPut } from '@libs/super-core/decorators/super-put.decorator';
import {
    Body,
    Controller,
    Param,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import _ from 'lodash';
import { Types } from 'mongoose';
import { PostType } from 'src/apis/posts/constants';
import { CreatePostDto } from 'src/apis/posts/dto/create-posts.dto';
import { UpdatePostDto } from 'src/apis/posts/dto/update-posts.dto';
import { PostsService } from 'src/apis/posts/posts.service';
import { UserPayload } from 'src/base/models/user-payload.model';
import { COLLECTION_NAMES } from 'src/constants';
import { Me } from 'src/decorators/me.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { IUploadedMulterFile } from 'src/packages/s3/s3.service';
import {
    ExtendedPagingDto,
    PagingDtoPipe,
} from 'src/pipes/page-result.dto.pipe';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { ParseObjectIdArrayPipe } from 'src/pipes/parse-object-ids.pipe';

@Controller('posts')
@Resource('posts')
@ApiTags('Admin: Posts')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.POST,
})
export class PostsControllerAdmin {
    constructor(private readonly postsService: PostsService) {}

    @SuperGet({ route: ':type' })
    @ApiParam({
        name: 'locale',
        required: false,
        type: String,
        description: 'The locale of the content',
    })
    async getAll(
        @Query(new PagingDtoPipe())
        queryParams: ExtendedPagingDto,
    ) {
        const result = await this.postsService.getAll(queryParams);

        return result;
    }

    @SuperGet({ route: ':id' })
    async getOne(@Param('id') id: string) {
        const result = await this.postsService.getOne(new Types.ObjectId(id));
        return result;
    }

    @SuperPost({ route: ':type', dto: CreatePostDto })
    @SuperAuthorize(PERMISSION.POST)
    @ApiParam({
        name: 'locale',
        required: false,
        type: String,
        description: 'The locale of the content',
    })
    @UseInterceptors(FileInterceptor('featuredImage'))
    async create(
        @Body() createPostDto: CreatePostDto,
        @Me() user: UserPayload,
        @Param('type') type: PostType,
        @UploadedFile() featuredImage: IUploadedMulterFile,
    ) {
        const { name } = createPostDto;

        const result = await this.postsService.createByType(
            createPostDto,
            type,
            user,
            featuredImage,
        );
        return result;
    }

    @SuperPut({ route: ':type/:id', dto: UpdatePostDto })
    @SuperAuthorize(PERMISSION.PUT)
    @ApiParam({ name: 'id', type: String })
    async update(
        @Param('id', ParseObjectIdPipe) _id: Types.ObjectId,
        @Body() updatePostDto: UpdatePostDto,
        @Param('type') type: PostType,
        @Me() user: UserPayload,
    ) {
        const { name } = updatePostDto;

        const result = await this.postsService.updateOneByIdAndType(
            _id,
            type,
            updatePostDto,
            user,
        );

        return result;
    }

    @SuperDelete({ route: ':type' })
    @SuperAuthorize(PERMISSION.DELETE)
    @ApiQuery({ name: 'ids', type: [String] })
    async deletes(
        @Query('ids', ParseObjectIdArrayPipe) _ids: Types.ObjectId[],
        @Param('type') type: PostType,
        @Me() user: UserPayload,
    ) {
        const result = await this.postsService.deleteManyByIdsAndType(
            _ids,
            type,
            user,
        );
        return result;
    }
}
