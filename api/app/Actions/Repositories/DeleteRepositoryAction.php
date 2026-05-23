<?php

namespace App\Actions\Repositories;

use App\Models\Repository;

class DeleteRepositoryAction
{
    public function execute(Repository $repository): void
    {
        if ($repository->local_path && is_dir($repository->local_path)) {
            $this->removeDirectory($repository->local_path);
        }

        $repository->delete();
    }

    private function removeDirectory(string $path): bool
    {
        if (!is_dir($path)) {
            return false;
        }

        $files = array_diff(scandir($path), ['.', '..']);

        foreach ($files as $file) {
            $filePath = $path . DIRECTORY_SEPARATOR . $file;

            if (is_dir($filePath)) {
                $this->removeDirectory($filePath);
            } else {
                unlink($filePath);
            }
        }

        return rmdir($path);
    }
}
