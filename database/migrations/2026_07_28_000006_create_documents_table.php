<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('reference')->unique();
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('request_type_id')->constrained('request_types');
            $table->foreignId('storage_location_id')->constrained('storage_locations');
            $table->date('approval_date')->nullable();
            $table->date('request_date')->nullable();
            $table->string('title')->nullable();
            $table->timestamp('scan_date')->useCurrent();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('branch_id');
            $table->index('request_type_id');
            $table->index('approval_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
