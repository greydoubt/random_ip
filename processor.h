#ifndef PROCESSOR_H
#define PROCESSOR_H

#ifdef __cplusplus
extern "C" {
#endif

// Runs the YAML + FFT processing pipeline
// Returns 0 on success, non-zero on error
int run_topology_processor(const char *yaml_file);

#ifdef __cplusplus
}
#endif

#endif
