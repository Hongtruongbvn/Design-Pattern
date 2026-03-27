import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MovieService } from './movies.service';
import { UserRole } from 'src/user/schema/user.schema';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo phim mới (Chỉ Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo phim thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phim' })
  findAll() {
    return this.movieService.findAll();
  }

  @Get('showing')
  @ApiOperation({ summary: 'Lấy danh sách phim đang chiếu' })
  findShowing() {
    return this.movieService.findShowing();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm phim theo tên' })
  search(@Query('title') title: string) {
    return this.movieService.searchByTitle(title);
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: 'Lấy phim theo thể loại' })
  findByGenre(@Param('genre') genre: string) {
    return this.movieService.findByGenre(genre);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phim theo ID' })
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin phim (Chỉ Admin)' })
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa phim (Chỉ Admin)' })
  remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }
}