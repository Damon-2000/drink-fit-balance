'use client'
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { apiConfig } from '@/config'
import { toggleExercise } from '@/domain/settings/store'
import { useExerciseToggles } from '../hooks'

export default function ExerciseToggleList() {
  const { exercises, isLoading, hasError, disabledIds, enabledExercises, isAllDisabled } = useExerciseToggles()

  return (
    <Card>
      <CardHeader
        title='運動代償類型'
        action={apiConfig.useMock && <Chip label='靜態資料模式' color='warning' size='small' />}
      />
      <CardContent>
        <Stack spacing={2}>
          {isLoading && <CircularProgress />}
          {hasError && !exercises && <Alert severity='error'>無法取得運動表</Alert>}
          {exercises?.length === 0 && <Alert severity='info'>運動表目前沒有任何運動</Alert>}

          {/* 開關狀態來自 localStorage，只在運動表取得後才顯示，伺服器端與首次渲染都不會用到它 */}
          {exercises && exercises.length > 0 && (
            <>
              <Stack>
                {exercises.map((exercise) => (
                  <FormControlLabel
                    key={exercise.id}
                    label={exercise.name}
                    control={
                      <Switch
                        checked={!disabledIds.includes(exercise.id)}
                        onChange={() => toggleExercise(exercise.id)}
                      />
                    }
                  />
                ))}
              </Stack>
              {isAllDisabled && <Alert severity='info'>目前全部關閉，運動代償會視同全部開啟</Alert>}
              <Typography variant='body2' color='text.secondary'>
                實際採用：{enabledExercises?.map((exercise) => exercise.name).join('、')}
              </Typography>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
